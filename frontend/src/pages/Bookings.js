import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      loadBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You have no bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                booking.status === 'cancelled' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{booking.court?.name}</h2>
                  <p className="text-gray-600 text-sm">{booking.court?.type}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p>
                  <strong>Start:</strong>{' '}
                  {new Date(booking.startTime).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
                </p>

                {booking.resources?.coach && (
                  <p>
                    <strong>Coach:</strong> {booking.resources.coach.name}
                  </p>
                )}

                {booking.resources?.equipment &&
                  booking.resources.equipment.length > 0 && (
                    <div>
                      <strong>Equipment:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {booking.resources.equipment.map((item, idx) => (
                          <li key={idx}>
                            {item.equipmentId?.name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="border-t pt-2 mt-2">
                  <p className="font-semibold">
                    Total: ₹{booking.pricingBreakdown?.total?.toFixed(2)}
                  </p>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;

