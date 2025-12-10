import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="All Bookings">
        <div className="text-center">Loading bookings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="All Bookings">
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No bookings found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.user?.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-500">{booking.user?.email || ''}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Court:</span>
                      <p className="text-sm text-gray-900">{booking.court?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 capitalize">{booking.court?.type}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Start:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">End:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(booking.endTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {booking.resources?.coach && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Coach:</span>
                        <p className="text-sm text-gray-900">{booking.resources.coach.name}</p>
                      </div>
                    )}

                    {booking.resources?.equipment && booking.resources.equipment.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Equipment:</span>
                        <p className="text-sm text-gray-900">
                          {booking.resources.equipment
                            .map((item) => `${item.equipmentId?.name} x${item.quantity}`)
                            .join(', ')}
                        </p>
                      </div>
                    )}

                    {booking.pricingBreakdown && (
                      <div className="bg-gray-50 rounded p-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Base:</span>
                          <span className="font-medium">₹{booking.pricingBreakdown.basePrice?.toFixed(2) || '0.00'}</span>
                        </div>
                        {booking.pricingBreakdown.peakFee > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">Peak:</span>
                            <span className="font-medium text-blue-600">+₹{booking.pricingBreakdown.peakFee?.toFixed(2)}</span>
                          </div>
                        )}
                        {booking.pricingBreakdown.weekendFee > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Weekend:</span>
                            <span className="font-medium text-green-600">+₹{booking.pricingBreakdown.weekendFee?.toFixed(2)}</span>
                          </div>
                        )}
                        {booking.pricingBreakdown.equipmentFee > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-purple-600">Equipment:</span>
                            <span className="font-medium text-purple-600">+₹{booking.pricingBreakdown.equipmentFee?.toFixed(2)}</span>
                          </div>
                        )}
                        {booking.pricingBreakdown.coachFee > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-orange-600">Coach:</span>
                            <span className="font-medium text-orange-600">+₹{booking.pricingBreakdown.coachFee?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-300 mt-1">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">₹{booking.pricingBreakdown.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Court
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Time
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      End Time
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Coach
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Equipment
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pricing Breakdown
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium">{booking.user?.name}</div>
                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm">{booking.court?.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{booking.court?.type}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {new Date(booking.startTime).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {new Date(booking.endTime).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(booking.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {booking.resources?.coach ? booking.resources.coach.name : '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                        {booking.resources?.equipment && booking.resources.equipment.length > 0
                          ? booking.resources.equipment
                              .map((item) => `${item.equipmentId?.name} x${item.quantity}`)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm">
                        {booking.pricingBreakdown && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              Base: ₹{booking.pricingBreakdown.basePrice?.toFixed(2) || '0.00'}
                            </div>
                            {booking.pricingBreakdown.peakFee > 0 && (
                              <div className="text-xs text-blue-600">
                                Peak: +₹{booking.pricingBreakdown.peakFee?.toFixed(2)}
                              </div>
                            )}
                            {booking.pricingBreakdown.weekendFee > 0 && (
                              <div className="text-xs text-green-600">
                                Weekend: +₹{booking.pricingBreakdown.weekendFee?.toFixed(2)}
                              </div>
                            )}
                            {booking.pricingBreakdown.equipmentFee > 0 && (
                              <div className="text-xs text-purple-600">
                                Equipment: +₹{booking.pricingBreakdown.equipmentFee?.toFixed(2)}
                              </div>
                            )}
                            {booking.pricingBreakdown.coachFee > 0 && (
                              <div className="text-xs text-orange-600">
                                Coach: +₹{booking.pricingBreakdown.coachFee?.toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-bold text-gray-900">
                        ₹{booking.pricingBreakdown?.total?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;

