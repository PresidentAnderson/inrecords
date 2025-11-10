'use client';

import Link from 'next/link';

export default function Academy() {
  return (
    <div className="min-h-screen bg-white text-black">
      <section className="p-12 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-playfair mb-6">inRECORD Academy</h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Empowering independent artists through world-class mentorship, production labs, and business literacy.
          </p>
          <Link href="/apply" className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-900 transition font-semibold inline-block">
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
}
