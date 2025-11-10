'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="flex flex-col items-center justify-center text-center p-12 py-32">
        <h1 className="text-7xl mb-6 font-playfair leading-tight">
          Where Independence<br />Sounds Infinite
        </h1>
        <p className="max-w-2xl text-gray-300 text-xl mb-10">
          Welcome to inRECORD — a next-generation independent label blending artistry, technology, and community.
        </p>
        <div className="flex gap-4">
          <Link href="/dao" className="px-8 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold">
            Explore Platform
          </Link>
        </div>
      </section>
    </div>
  );
}
