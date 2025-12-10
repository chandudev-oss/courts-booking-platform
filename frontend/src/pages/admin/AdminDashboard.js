import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { statsAPI } from '../../services/api';

const cardBase =
  'bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard" subtitle="Loading statistics...">
        <div className="text-center py-8">Loading dashboard data...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of your sports facility">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-green-100 text-xs md:text-sm font-medium">Total Revenue</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">₹{stats?.revenue?.total || '0.00'}</p>
              <p className="text-green-100 text-xs mt-1">From all bookings</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-3 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-xs md:text-sm font-medium">Total Bookings</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats?.bookings?.total || 0}</p>
              <p className="text-blue-100 text-xs mt-1">
                {stats?.bookings?.confirmed || 0} confirmed, {stats?.bookings?.cancelled || 0} cancelled
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-3 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Courts */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-xs md:text-sm font-medium">Active Courts</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats?.courts?.active || 0}</p>
              <p className="text-purple-100 text-xs mt-1">
                of {stats?.courts?.total || 0} total courts
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-3 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-orange-100 text-xs md:text-sm font-medium">Today's Bookings</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats?.bookings?.today || 0}</p>
              <p className="text-orange-100 text-xs mt-1">
                {stats?.bookings?.upcoming || 0} upcoming this week
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-3 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Statistics */}
      {stats?.pricingBreakdown && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Average Pricing Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-xs font-medium mb-1">Base Price</p>
              <p className="text-base md:text-lg font-bold text-gray-900">₹{stats.pricingBreakdown.avgBasePrice}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-600 text-xs font-medium mb-1">Peak Fee</p>
              <p className="text-lg font-bold text-blue-900">₹{stats.pricingBreakdown.avgPeakFee}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-600 text-xs font-medium mb-1">Weekend Fee</p>
              <p className="text-lg font-bold text-green-900">₹{stats.pricingBreakdown.avgWeekendFee}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-600 text-xs font-medium mb-1">Equipment Fee</p>
              <p className="text-lg font-bold text-purple-900">₹{stats.pricingBreakdown.avgEquipmentFee}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-600 text-xs font-medium mb-1">Coach Fee</p>
              <p className="text-lg font-bold text-orange-900">₹{stats.pricingBreakdown.avgCoachFee}</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-600 text-xs font-medium mb-1">Avg Total</p>
              <p className="text-lg font-bold text-indigo-900">₹{stats.pricingBreakdown.avgTotal}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resource Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Active Coaches</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                {stats?.coaches?.active || 0}/{stats?.coaches?.total || 0}
              </p>
            </div>
            <div className="text-blue-500 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Active Equipment</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                {stats?.equipment?.active || 0}/{stats?.equipment?.total || 0}
              </p>
            </div>
            <div className="text-green-500 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Pricing Rules</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                {stats?.pricingRules?.active || 0}/{stats?.pricingRules?.total || 0}
              </p>
            </div>
            <div className="text-purple-500 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Avg Booking Value</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                ₹{stats?.revenue?.averageBooking || '0.00'}
              </p>
            </div>
            <div className="text-orange-500 flex-shrink-0 ml-2">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      {stats?.recentBookings && stats.recentBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Bookings</h2>
        <Link
              to="/admin/bookings"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {stats.recentBookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{booking.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{booking.user?.email || ''}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-900 mb-1">{booking.court?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(booking.startTime).toLocaleDateString()}{' '}
                  {new Date(booking.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{booking.pricingBreakdown?.total?.toFixed(2) || '0.00'}
                </p>
              </div>
            ))}
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Court
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {booking.court?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleDateString()}{' '}
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{booking.pricingBreakdown?.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <Link to="/admin/courts" className={cardBase}>
          <div className="p-4 md:p-6 space-y-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Manage Courts</h2>
            <p className="text-gray-600 text-xs md:text-sm">Add, edit, or remove courts</p>
          </div>
        </Link>

        <Link to="/admin/coaches" className={cardBase}>
          <div className="p-4 md:p-6 space-y-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Manage Coaches</h2>
            <p className="text-gray-600 text-xs md:text-sm">Add, edit, or remove coaches</p>
          </div>
        </Link>

        <Link to="/admin/equipment" className={cardBase}>
          <div className="p-4 md:p-6 space-y-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Manage Equipment</h2>
            <p className="text-gray-600 text-xs md:text-sm">Add, edit, or remove equipment</p>
          </div>
        </Link>

        <Link to="/admin/pricing-rules" className={cardBase}>
          <div className="p-4 md:p-6 space-y-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Pricing Rules</h2>
            <p className="text-gray-600 text-xs md:text-sm">Configure dynamic pricing rules</p>
          </div>
        </Link>

        <Link to="/admin/bookings" className={cardBase}>
          <div className="p-4 md:p-6 space-y-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">All Bookings</h2>
            <p className="text-gray-600 text-xs md:text-sm">View and manage all bookings</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

