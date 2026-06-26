import { useState } from 'react';
import { useHotelRooms } from '../../hotels/api/useHotelQuery';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../auth/authSelectors';
import toast from 'react-hot-toast';
import BookingModal from '../../bookings/components/BookingModal';

export default function RoomList({ hotelId }) {
  const { data, isLoading, error } = useHotelRooms(hotelId);
  const rooms = data?.rooms || [];
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleBook = (room) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a room.');
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
  };

  if (isLoading) return <div className="py-8 text-center text-[#717378]">Loading available rooms...</div>;
  if (error) return <div className="py-8 text-center text-red-500">Failed to load rooms.</div>;
  if (!rooms || rooms.length === 0) return <div className="py-8 text-center text-[#717378]">No rooms available for this hotel.</div>;

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-serif font-bold text-[#04162E] mb-6">Available Rooms</h2>
      {rooms.map((room) => (
        <div key={room.id} className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-[#EEEEEE] overflow-hidden">
          <div className="md:w-1/3 h-48 md:h-auto bg-gray-100">
            {room.images && room.images.length > 0 ? (
              <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#717378]">No Image</div>
            )}
          </div>
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-[#04162E] capitalize">{room.type} Room</h3>
                <span className="text-lg font-semibold text-[#C5A059]">₹{room.price} <span className="text-sm text-[#717378] font-normal">/ night</span></span>
              </div>
              <p className="text-[#717378] text-sm mb-4 line-clamp-2">{room.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-sm text-[#717378]">
                  <Users className="w-4 h-4 mr-1.5" />
                  Up to {room.capacity} guests
                </div>
                {room.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-sm text-[#717378] capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => handleBook(room)}
                className="px-6 py-2.5 bg-[#04162E] text-white rounded-lg font-medium hover:bg-[#0B2545] transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedRoom && (
        <BookingModal 
          isOpen={!!selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
          room={selectedRoom} 
          hotelId={hotelId} 
        />
      )}
    </div>
  );
}
