import { useAdminUsers, useAdminHotels, useAdminBookings } from '../api/useAdminQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { Users, Building, Calendar, TrendingUp, IndianRupee } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const { data: usersData, isLoading: isUsersLoading } = useAdminUsers({ page: 1, limit: 1 });
    const { data: hotelsData, isLoading: isHotelsLoading } = useAdminHotels({ page: 1, limit: 1 });
    const { data: bookingsData, isLoading: isBookingsLoading } = useAdminBookings({ page: 1, limit: 100 }); // fetch more to calculate revenue

    if (isUsersLoading || isHotelsLoading || isBookingsLoading) return <FullScreenLoader />;

    const totalUsers = usersData?.totalItems || 0;
    const totalHotels = hotelsData?.totalItems || 0;
    const totalBookings = bookingsData?.totalItems || 0;
    
    // Approximate revenue from recent bookings fetched
    const recentRevenue = (bookingsData?.allBookings || [])
        .filter(b => b.paymentStatus === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6 flex items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${colorClass}`}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-sm font-semibold text-[#717378] uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-[#04162E]">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#04162E] font-serif mb-2">Platform Overview</h1>
                <p className="text-[#717378]">System-wide metrics and performance indicators.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Users" 
                    value={totalUsers} 
                    icon={Users} 
                    colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                    title="Total Hotels" 
                    value={totalHotels} 
                    icon={Building} 
                    colorClass="bg-indigo-50 text-indigo-600" 
                />
                <StatCard 
                    title="Total Bookings" 
                    value={totalBookings} 
                    icon={Calendar} 
                    colorClass="bg-green-50 text-green-600" 
                />
                <StatCard 
                    title="Recent Revenue" 
                    value={`₹${recentRevenue}`} 
                    icon={IndianRupee} 
                    colorClass="bg-yellow-50 text-[#C5A059]" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Placeholder for Charts / Visuals */}
                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6">
                    <h3 className="text-lg font-bold text-[#04162E] mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-[#C5A059]" /> Booking Trends
                    </h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#EEEEEE] rounded-lg bg-[#FBF9FB]">
                        <p className="text-[#717378] font-medium">Chart visualization will be displayed here</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#EEEEEE] p-6">
                    <h3 className="text-lg font-bold text-[#04162E] mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-[#C5A059]" /> Recent User Registrations
                    </h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#EEEEEE] rounded-lg bg-[#FBF9FB]">
                        <p className="text-[#717378] font-medium">User growth chart will be displayed here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
