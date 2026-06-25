import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../authSelectors';
import { authApi } from '../api/authApi';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { loginSuccess, logout } from '../authSlice';
import FormInput from '../../../components/ui/FormInput';
import Modal from '../../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    }
  });

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('phoneNumber', user.phoneNumber);
      setValue('gender', user.gender);
      setValue('dateOfBirth', user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'profilePicture' && data[key]) {
          formData.append(key, data[key]);
        }
      });
      if (data.profilePicture && data.profilePicture[0]) {
        formData.append('profilePicture', data.profilePicture[0]);
      }

      const res = await authApi.updateUser(formData);
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully');
        dispatch(loginSuccess({ user: { ...user, ...res.data }, token: localStorage.getItem('token') }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authApi.deleteUser();
      toast.success('Account deleted successfully');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">My Profile</h1>
        <p className="text-[#717378]">Update your personal information and profile picture.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-[#EEEEEE]">
              <img src={user?.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Profile Picture</label>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                {...register('profilePicture')}
                className="block w-full text-sm text-[#717378] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#F8F6F2] file:text-[#04162E] hover:file:bg-[#EEEEEE] cursor-pointer"
              />
              <p className="text-xs text-[#717378] mt-2">JPG, PNG, or WEBP. Max 10MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="First Name" 
              {...register('firstName', { required: 'First name is required' })} 
              error={errors.firstName}
            />
            <FormInput 
              label="Last Name" 
              {...register('lastName', { required: 'Last name is required' })} 
              error={errors.lastName}
            />
            <FormInput 
              label="Email" 
              value={user?.email || ''}
              disabled
              className="opacity-70 cursor-not-allowed bg-gray-50"
            />
            <FormInput 
              label="Phone Number" 
              {...register('phoneNumber', { 
                required: 'Phone number is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
              })} 
              error={errors.phoneNumber}
            />
            <div>
              <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">Gender</label>
              <select 
                {...register('gender')}
                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#1A2B44] focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-opacity-50 focus:ring-[#C5A059] transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <FormInput 
              label="Date of Birth" 
              type="date"
              {...register('dateOfBirth')} 
            />
          </div>

          <div className="pt-6 border-t border-[#EEEEEE] flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-100 p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-red-700 mb-2 font-serif">Danger Zone</h2>
        <p className="text-red-600 mb-6 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        actions={
          <>
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-[#717378] hover:bg-[#F8F6F2] rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-70 ml-2"
            >
              {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
            </button>
          </>
        }
      >
        <p className="text-[#1A2B44]">Are you sure you want to delete your account? This action cannot be undone and will permanently remove your profile.</p>
      </Modal>
    </div>
  );
}
