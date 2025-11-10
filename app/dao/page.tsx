import Link from 'next/link'

export default function DAO() {
  return (
    <section
      className="min-h-screen text-white p-12"
      style={{
        background: 'linear-gradient(180deg, #0B0B0B 0%, #0B0B0B 40%, #0d1321 100%)'
      }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-playfair mb-4">INRecords DAO</h2>
        <p className="text-lg max-w-2xl mb-8">
          Join the fan-powered label. Vote on artwork, fund special projects, and access behind-the-scenes. Participation over speculation.
        </p>
        <Link href="/join-dao" className="inline-block px-6 py-3 bg-aurora text-black rounded-full hover:opacity-80 transition">
          Join the DAO
        </Link>

        {/* Capabilities */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { title: 'Curation Votes', description: 'Help select singles, artwork, and remixes.' },
            { title: 'Project Funding', description: 'Back vinyl pressings and collab sessions.' },
            { title: 'Token-Gated Access', description: 'Members-only live streams and stems.' },
          ].map((capability) => (
            <div key={capability.title} className="rounded-2xl p-6 border border-white/10 bg-black/40">
              <h3 className="font-semibold mb-2">{capability.title}</h3>
              <p className="text-sm text-white/80">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
