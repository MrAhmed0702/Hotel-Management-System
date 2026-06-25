import { useState } from 'react';
import { useAdminUsers, useAdminDeletedUsers, useUpdateUserRole, useDeleteUser, useRestoreUser } from '../api/useAdminQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import Pagination from '../../../components/ui/Pagination';
import Modal from '../../../components/ui/Modal';
import { format } from 'date-fns';
import { Shield, User, Trash2, RefreshCw, Filter } from 'lucide-react';

export default function AdminUsersPage() {
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'deleted'
    const limit = 10;

    const { data: activeData, isLoading: isActiveLoading } = useAdminUsers({ page, limit });
    const { data: deletedData, isLoading: isDeletedLoading } = useAdminDeletedUsers({ page, limit });

    const updateRoleMutation = useUpdateUserRole();
    const deleteMutation = useDeleteUser();
    const restoreMutation = useRestoreUser();

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('user');

    const isLoading = viewMode === 'active' ? isActiveLoading : isDeletedLoading;
    const data = viewMode === 'active' ? activeData : deletedData;
    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setRoleModalOpen(true);
    };

    const handleUpdateRole = async () => {
        try {
            await updateRoleMutation.mutateAsync({ id: selectedUser.id, role: selectedRole });
            setRoleModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm('Are you sure you want to restore this user?')) {
            await restoreMutation.mutateAsync(id);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center w-max"><Shield className="w-3 h-3 mr-1" /> Admin</span>;
            case 'owner': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center w-max"><BuildingIcon className="w-3 h-3 mr-1" /> Owner</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase flex items-center w-max"><User className="w-3 h-3 mr-1" /> User</span>;
        }
    };

    if (isLoading) return <FullScreenLoader />;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">User Management</h1>
                    <p className="text-[#717378]">View, modify roles, and manage all users on the platform.</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-[#EEEEEE] shadow-sm">
                    <button 
                        onClick={() => { setViewMode('active'); setPage(1); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'active' ? 'bg-[#04162E] text-white' : 'text-[#717378] hover:bg-gray-50'}`}
                    >
                        Active Users
                    </button>
                    <button 
                        onClick={() => { setViewMode('deleted'); setPage(1); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'deleted' ? 'bg-red-600 text-white' : 'text-[#717378] hover:bg-gray-50'}`}
                    >
                        Deactivated Users
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FBF9FB] border-b border-[#EEEEEE] text-[#1A2B44] text-sm font-semibold uppercase tracking-wider">
                                <th className="p-4">User</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EEEEEE]">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[#717378]">No users found in this category.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5E5E5]">
                                                    <img src={user.profilePicture} alt={user.firstName} className="object-cover" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-bold text-[#04162E]">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-[#717378]">ID: {user.id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-[#1A2B44] font-medium">{user.email}</p>
                                            <p className="text-xs text-[#717378]">{user.phoneNumber || 'N/A'}</p>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4 text-sm text-[#717378]">
                                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4 text-right">
                                            {viewMode === 'active' ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => handleOpenRoleModal(user)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                                                    >
                                                        Change Role
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Deactivate User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRestore(user.id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors flex items-center justify-end ml-auto"
                                                >
                                                    <RefreshCw className="w-3 h-3 mr-1" /> Restore
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(e, val) => setPage(val)} 
                    />
                </div>
            )}

            {/* Role Update Modal */}
            <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title="Update User Role"
                actions={
                    <>
                        <button 
                            onClick={() => setRoleModalOpen(false)}
                            className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpdateRole}
                            disabled={updateRoleMutation.isPending}
                            className="px-6 py-2 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors ml-2"
                        >
                            {updateRoleMutation.isPending ? 'Updating...' : 'Save Role'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-[#1A2B44]">
                        Select a new role for <span className="font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</span>:
                    </p>
                    <select 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </Modal>

        </div>
    );
}

// Mini component for BuildingIcon since it was missing import
function BuildingIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    );
}
