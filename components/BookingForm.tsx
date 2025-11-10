'use client';

/**
 * Studio Booking Form Component
 * Allows users to book studio sessions with real-time availability checking
 */

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import type { RoomType, RoomPricing, AvailabilitySlot } from '@/lib/supabase/types';

interface BookingFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function BookingForm({ onSuccess, onError }: BookingFormProps) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    user_wallet: '',
    room_type: 'recording' as RoomType,
    session_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    session_time: '10:00',
    duration_hours: 2,
    notes: '',
  });

  const [roomPricing, setRoomPricing] = useState<RoomPricing[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Fetch room pricing on mount
  useEffect(() => {
    fetchRoomPricing();
  }, []);

  // Check availability when date or room type changes
  useEffect(() => {
    if (formData.session_date && formData.room_type) {
      checkAvailability();
    }
  }, [formData.session_date, formData.room_type]);

  // Calculate total cost when room type or duration changes
  useEffect(() => {
    calculateCost();
  }, [formData.room_type, formData.duration_hours, roomPricing]);

  const fetchRoomPricing = async () => {
    try {
      const response = await fetch('/api/bookings/pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing');
      const data = await response.json();
      setRoomPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/bookings/availability?date=${formData.session_date}&roomType=${formData.room_type}`
      );
      if (!response.ok) throw new Error('Failed to check availability');
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    const pricing = roomPricing.find((p) => p.room_type === formData.room_type);
    if (pricing) {
      setTotalCost(Number(pricing.hourly_rate) * formData.duration_hours);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Reset form
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        user_wallet: '',
        room_type: 'recording',
        session_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        session_time: '10:00',
        duration_hours: 2,
        notes: '',
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting booking:', error);
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration_hours' ? parseInt(value) : value,
    }));
  };

  const selectedPricing = roomPricing.find((p) => p.room_type === formData.room_type);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Information</h2>

        <div>
          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            required
            value={formData.user_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="user_email"
            name="user_email"
            required
            value={formData.user_email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="user_phone"
            name="user_phone"
            required
            value={formData.user_phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="user_wallet" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Address (Optional)
          </label>
          <input
            type="text"
            id="user_wallet"
            name="user_wallet"
            value={formData.user_wallet}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            placeholder="0x..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Connect your wallet to be eligible for DAO funding
          </p>
        </div>
      </div>

      {/* Session Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Details</h2>

        <div>
          <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">
            Room Type *
          </label>
          <select
            id="room_type"
            name="room_type"
            required
            value={formData.room_type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {roomPricing.map((room) => (
              <option key={room.room_type} value={room.room_type}>
                {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} - $
                {room.hourly_rate}/hr
              </option>
            ))}
          </select>
          {selectedPricing && (
            <div className="mt-2 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-700">{selectedPricing.description}</p>
              {selectedPricing.features && selectedPricing.features.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {selectedPricing.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-purple-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="session_date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="session_date"
              name="session_date"
              required
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              value={formData.session_date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <select
              id="duration_hours"
              name="duration_hours"
              required
              value={formData.duration_hours}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hour{hours > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Time Slots *
          </label>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availability.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, session_time: slot.time }))
                  }
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      formData.session_time === slot.time
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : slot.available
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }
                  `}
                >
                  {slot.time.substring(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Tell us about your project, any special requirements, equipment needs, etc."
          />
        </div>
      </div>

      {/* Cost Summary and Submit */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm opacity-90">Total Cost</p>
            <p className="text-4xl font-bold">${totalCost.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">
              {formData.duration_hours} hour(s) × ${selectedPricing?.hourly_rate || 0}/hr
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Session</p>
            <p className="text-lg font-semibold">
              {format(new Date(formData.session_date), 'MMM d, yyyy')}
            </p>
            <p className="text-sm">{formData.session_time.substring(0, 5)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.session_time}
          className="w-full bg-white text-purple-600 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Book Session'
          )}
        </button>

        <p className="text-xs text-center mt-3 opacity-75">
          You'll receive a confirmation email after submitting
        </p>
      </div>
    </form>
  );
}
