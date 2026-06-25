import { useParams, useNavigate } from 'react-router-dom';
import { useHotelDetails } from '../api/useHotelQuery';
import FullScreenLoader from '../../../components/ui/FullScreenLoader';
import { MapPin, Star, ChevronLeft } from 'lucide-react';
import RoomList from '../components/RoomList';

export default function HotelDetailsPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { data: hotel, isLoading, error } = useHotelDetails(hotelId);

  if (isLoading) return <FullScreenLoader />;
  if (error || !hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9FB]">
        <h2 className="text-2xl font-bold text-[#04162E] mb-4">Hotel not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#C5A059] hover:underline flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9FB] pb-20">
      {/* Header / Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
        {hotel.images && hotel.images.length > 0 ? (
          <img src={hotel.images[0]} alt={hotel.hotelName} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white opacity-50">No Image Available</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-white mb-6 flex items-center text-sm font-medium hover:text-[#C5A059] transition-colors w-fit">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#C5A059] text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {hotel.category}
            </span>
            <div className="flex items-center text-[#F8F6F2]">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] mr-1" />
              <span className="font-medium">{hotel.averageRating || 'New'}</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 capitalize">{hotel.hotelName}</h1>
          <div className="flex items-center text-gray-300 text-sm md:text-base">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>{hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state}, {hotel.address?.country}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-serif font-bold text-[#04162E] mb-4">About this hotel</h2>
            <p className="text-[#717378] leading-relaxed whitespace-pre-line">{hotel.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-[#04162E] mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities?.length > 0 ? hotel.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center text-[#1A2B44] capitalize bg-white p-3 rounded-lg border border-[#EEEEEE] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059] mr-3"></span>
                  {amenity}
                </div>
              )) : (
                <p className="text-[#717378] col-span-full">No amenities listed.</p>
              )}
            </div>
          </section>

          {/* Rooms */}
          <RoomList hotelId={hotel.id} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 sticky top-24">
            <h3 className="text-xl font-bold text-[#04162E] mb-4 border-b border-[#EEEEEE] pb-4">Hotel Policies</h3>
            <ul className="space-y-4 text-sm text-[#717378]">
              <li className="flex justify-between">
                <span className="font-medium text-[#1A2B44]">Check-in</span>
                <span>After 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-[#1A2B44]">Check-out</span>
                <span>Before 11:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-[#1A2B44]">Cancellation</span>
                <span>48 hours prior</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-[#1A2B44]">Pets</span>
                <span>Not allowed</span>
              </li>
            </ul>
            
            <div className="mt-8 bg-[#F8F6F2] p-4 rounded-xl">
              <h4 className="font-semibold text-[#04162E] mb-2 flex items-center">
                <Star className="w-4 h-4 mr-1.5 text-[#C5A059]" /> Need Help?
              </h4>
              <p className="text-xs text-[#717378]">Contact our support team for any special requests or questions about your stay.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
