'use client';

/**
 * Studio Session Booking Page
 * Main page for users to book studio sessions
 */

import { useState } from 'react';
import BookingForm from '@/components/BookingForm';

export default function BookSessionPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setShowSuccess(true);
    setError(null);
    // Auto-hide success message after 10 seconds
    setTimeout(() => setShowSuccess(false), 10000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowSuccess(false);
    // Auto-hide error message after 8 seconds
    setTimeout(() => setError(null), 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Book a Studio Session</h1>
            <p className="text-xl opacity-90 mb-6">
              Professional recording studios for artists, producers, and creators
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Professional Equipment
              </div>
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Flexible Scheduling
              </div>
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                DAO Funding Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          {showSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-lg mb-6 animate-slide-down">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-green-800 font-bold text-lg mb-1">
                    Booking Request Submitted!
                  </h3>
                  <p className="text-green-700">
                    We've received your studio booking request. You'll receive a confirmation
                    email shortly with all the details. Our team will review your booking and
                    confirm availability within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-green-500 hover:text-green-700 ml-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg mb-6 animate-slide-down">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-lg mb-1">Booking Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <BookingForm onSuccess={handleSuccess} onError={handleError} />

        {/* Info Section */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Submit Your Booking</h3>
                  <p className="text-gray-600">
                    Fill out the form above with your preferred date, time, and room type. We'll
                    send you an immediate confirmation email.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Confirmation</h3>
                  <p className="text-gray-600">
                    Our team will review your booking and confirm availability within 24 hours.
                    You'll receive another email once confirmed.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Prepare for Your Session</h3>
                  <p className="text-gray-600">
                    Bring your project files, arrive 10 minutes early, and get ready to create!
                    We'll have everything set up and ready for you.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">DAO Funding</h3>
              <p className="text-gray-600 mb-3">
                Connect your wallet to be eligible for DAO-funded sessions. Our community can vote
                to fund promising artists and projects.
              </p>
              <a
                href="/dao"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
              >
                Learn more about DAO funding
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Questions?</h3>
              <p className="text-gray-600 mb-3">
                Contact us at{' '}
                <a
                  href="mailto:bookings@inrecord.io"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  bookings@inrecord.io
                </a>{' '}
                or call us at{' '}
                <a
                  href="tel:+15551234567"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  +1 (555) 123-4567
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
