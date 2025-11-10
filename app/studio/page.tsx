import Link from 'next/link'

export default function Studio() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-playfair mb-4">IN Studio Montréal</h2>
        <p className="text-lg max-w-2xl mb-8">
          A creative HQ merging recording, design, and AI production — featuring Control Room, Sound Lab, AI Suite, and
          an Immersive Listening Room.
        </p>
        <Link href="/book-session" className="inline-block px-6 py-3 bg-gold text-black rounded-full hover:opacity-90 transition">
          Book a Session
        </Link>

        {/* Rooms */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {['Control Room', 'Sound Lab', 'AI Suite', 'Immersive Room'].map((room) => (
            <div key={room} className="border border-gray-800/60 rounded-2xl p-6 bg-black/40">
              <p className="text-sm text-gray-300">{room}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
