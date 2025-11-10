'use client';

/**
 * Admin Dashboard - Studio Bookings Management
 * Allows admins to view, manage, and update studio session bookings
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { StudioSession, SessionStatus, RoomType } from '@/lib/supabase/types';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  daoFunded: number;
  totalRevenue: number;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<StudioSession[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: SessionStatus;
    roomType?: RoomType;
    startDate?: string;
    endDate?: string;
  }>({});
  const [selectedBooking, setSelectedBooking] = useState<StudioSession | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.roomType) params.append('roomType', filter.roomType);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/bookings/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: SessionStatus) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      // Refresh bookings and stats
      await fetchBookings();
      await fetchStats();

      // Update selected booking if it's the one being modified
      if (selectedBooking?.id === bookingId) {
        const updatedBooking = bookings.find((b) => b.id === bookingId);
        if (updatedBooking) {
          setSelectedBooking({ ...updatedBooking, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const toggleDaoFunding = async (bookingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dao_funded: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update DAO funding status');

      await fetchBookings();
      await fetchStats();
    } catch (error) {
      console.error('Error updating DAO funding:', error);
      alert('Failed to update DAO funding status');
    }
  };

  const getStatusColor = (status: SessionStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoomTypeColor = (roomType: RoomType) => {
    const colors = {
      recording: 'bg-purple-100 text-purple-800',
      mixing: 'bg-indigo-100 text-indigo-800',
      mastering: 'bg-pink-100 text-pink-800',
      podcast: 'bg-orange-100 text-orange-800',
      rehearsal: 'bg-teal-100 text-teal-800',
    };
    return colors[roomType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Studio Bookings Management</h1>
          <p className="text-purple-100">Manage and monitor all studio session bookings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
              <p className="text-sm text-blue-800 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-900">{stats.confirmed}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
              <p className="text-sm text-green-800 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
              <p className="text-sm text-red-800 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
              <p className="text-sm text-purple-800 mb-1">DAO Funded</p>
              <p className="text-2xl font-bold text-purple-900">{stats.daoFunded}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg shadow p-4 border border-emerald-200">
              <p className="text-sm text-emerald-800 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-900">
                ${stats.totalRevenue.toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status || ''}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value as SessionStatus | undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                value={filter.roomType || ''}
                onChange={(e) =>
                  setFilter({ ...filter, roomType: e.target.value as RoomType | undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Rooms</option>
                <option value="recording">Recording</option>
                <option value="mixing">Mixing</option>
                <option value="mastering">Mastering</option>
                <option value="podcast">Podcast</option>
                <option value="rehearsal">Rehearsal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filter.startDate || ''}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(booking.session_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.session_time.substring(0, 5)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
                        <div className="text-sm text-gray-500">{booking.user_email}</div>
                        {booking.user_phone && (
                          <div className="text-sm text-gray-500">{booking.user_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoomTypeColor(
                            booking.room_type
                          )}`}
                        >
                          {booking.room_type.charAt(0).toUpperCase() + booking.room_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.duration_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${booking.total_cost?.toFixed(2)}
                        </div>
                        {booking.dao_funded && (
                          <span className="text-xs text-green-600 font-medium">DAO Funded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetails(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          View
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
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
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
                  <p className="text-sm opacity-90">ID: {selectedBooking.id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{selectedBooking.user_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{selectedBooking.user_email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedBooking.user_phone || 'N/A'}
                    </dd>
                  </div>
                  {selectedBooking.user_wallet && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Wallet</dt>
                      <dd className="text-sm text-gray-900 font-mono break-all">
                        {selectedBooking.user_wallet}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Session Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Session Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Room Type</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedBooking.room_type.charAt(0).toUpperCase() +
                        selectedBooking.room_type.slice(1)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">
                      {format(new Date(selectedBooking.session_date), 'MMMM d, yyyy')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedBooking.session_time.substring(0, 5)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900">{selectedBooking.duration_hours} hours</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
                    <dd className="text-sm text-gray-900 font-bold">
                      ${selectedBooking.total_cost?.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          selectedBooking.status
                        )}`}
                      >
                        {selectedBooking.status.toUpperCase()}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'confirmed');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'completed');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'cancelled');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={() => toggleDaoFunding(selectedBooking.id, selectedBooking.dao_funded)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedBooking.dao_funded
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {selectedBooking.dao_funded ? 'Remove DAO Funding' : 'Mark as DAO Funded'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
