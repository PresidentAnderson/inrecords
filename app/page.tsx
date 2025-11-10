import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center p-12 py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <h1 className="text-7xl mb-6 font-playfair inr-fade leading-tight">
          Where Independence<br />Sounds Infinite
        </h1>
        <p className="max-w-2xl text-gray-300 text-xl mb-10 inr-fade">
          Welcome to inRECORD — a next-generation independent label blending artistry, technology, and community.
          Where artists own their careers, fans shape the culture, and AI amplifies creativity.
        </p>
        <div className="flex gap-4 inr-fade">
          <Link href="/academy" className="px-8 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold">
            Join Academy
          </Link>
          <Link href="/dao" className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-semibold">
            Explore DAO
          </Link>
        </div>
      </section>

      {/* What We Do */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">The inRECORD Ecosystem</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🎓',
                title: 'Academy',
                description: '12-week artist development intensive. Master your craft, build your brand, own your rights.',
                link: '/academy',
                color: 'aurora'
              },
              {
                icon: '🎚️',
                title: 'Studio',
                description: 'World-class Montréal recording facility. Analog warmth meets AI-powered innovation.',
                link: '/studio',
                color: 'gold'
              },
              {
                icon: '🤖',
                title: 'AI Lab',
                description: 'Cutting-edge music tech research. Adaptive mastering, generative soundscapes, ethical AI.',
                link: '/ai-lab',
                color: 'aurora'
              },
              {
                icon: '🗳️',
                title: 'DAO',
                description: 'Fan-powered governance. Vote on releases, fund projects, share in the success.',
                link: '/dao',
                color: 'gold'
              },
            ].map((pillar) => (
              <Link
                key={pillar.title}
                href={pillar.link}
                className="group border border-gray-800 rounded-2xl p-8 hover:border-aurora transition"
              >
                <div className="text-5xl mb-4">{pillar.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 group-hover:text-aurora transition">{pillar.title}</h3>
                <p className="text-gray-400 text-sm">{pillar.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">Featured Artists</h2>
          <p className="text-center text-gray-400 mb-12">
            Independent voices shaping the future of music
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Luna Vega',
                genre: 'Indie Electronic',
                status: 'Academy Alumni • DAO Member',
                achievement: '500K+ streams on debut EP',
                image: '🌙'
              },
              {
                name: 'The Frequency Collective',
                genre: 'Jazz Fusion',
                status: 'Studio Resident',
                achievement: 'Live session series recorded at IN Studio',
                image: '🎷'
              },
              {
                name: 'Aria Chen',
                genre: 'Alt R&B',
                status: 'Academy Cohort 3',
                achievement: 'Sync deal with Netflix series',
                image: '✨'
              },
            ].map((artist) => (
              <div key={artist.name} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-aurora/50 transition">
                <div className="text-6xl mb-4 text-center">{artist.image}</div>
                <h3 className="text-xl font-semibold mb-1 text-center">{artist.name}</h3>
                <div className="text-aurora text-sm font-semibold mb-2 text-center">{artist.genre}</div>
                <div className="text-xs text-gray-500 mb-4 text-center">{artist.status}</div>
                <p className="text-sm text-gray-400 text-center">{artist.achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">By The Numbers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '2,847', label: 'DAO Members', sublabel: 'Shaping label decisions' },
              { value: '120+', label: 'Academy Alumni', sublabel: 'Across 7 cohorts' },
              { value: '$127K', label: 'Treasury Value', sublabel: 'Community-owned' },
              { value: '15+', label: 'Research Partners', sublabel: 'Universities & companies' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                <div className="text-5xl font-bold text-aurora mb-2">{stat.value}</div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-playfair mb-6 text-center">Our Philosophy</h2>
          <div className="space-y-8">
            {[
              {
                title: 'Independence First',
                description: 'Artists should own their masters, control their careers, and keep the majority of their earnings. We provide the infrastructure without the exploitation.'
              },
              {
                title: 'Community Over Capital',
                description: 'Fans aren't just consumers—they're participants. Through the DAO, our community votes on releases, funds projects, and shares in our collective success.'
              },
              {
                title: 'Technology as Amplifier',
                description: 'AI should enhance human creativity, not replace it. Our research focuses on ethical, artist-first tools that empower rather than automate.'
              },
              {
                title: 'Transparency Always',
                description: 'Open books, open source, open governance. Every dollar, every decision, every line of code—accountable to the community.'
              },
            ].map((principle) => (
              <div key={principle.title} className="border-l-4 border-aurora pl-6">
                <h3 className="text-2xl font-semibold mb-3">{principle.title}</h3>
                <p className="text-gray-400">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-playfair">Latest News</h2>
            <Link href="/news" className="text-aurora hover:underline">View All →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                date: 'Jan 15, 2025',
                category: 'Academy',
                title: 'Cohort 8 Applications Now Open',
                description: '20 spots available for our 12-week artist development intensive. 50% reserved for underrepresented artists.',
                link: '/academy'
              },
              {
                date: 'Jan 10, 2025',
                category: 'Research',
                title: 'Adaptive Mastering Plugin Enters Beta',
                description: 'Our AI-powered mastering tool is now available for beta testing. Genre-aware, reference-matching, artist-first.',
                link: '/ai-lab'
              },
              {
                date: 'Dec 28, 2024',
                category: 'DAO',
                title: 'Q4 Treasury Report Published',
                description: '$127K in assets, 89% voter participation, and 43 proposals passed. Full transparency, always.',
                link: '/dao#treasury'
              },
            ].map((news) => (
              <Link
                key={news.title}
                href={news.link}
                className="group bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-aurora/50 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs px-3 py-1 bg-aurora/20 text-aurora rounded-full">{news.category}</span>
                  <span className="text-xs text-gray-500">{news.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-aurora transition">{news.title}</h3>
                <p className="text-sm text-gray-400">{news.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-12 py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Ready to Build With Us?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Whether you're an artist, fan, researcher, or industry partner—there's a place for you at inRECORD.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'For Artists', link: '/academy', cta: 'Apply to Academy' },
              { title: 'For Fans', link: '/dao', cta: 'Join the DAO' },
              { title: 'For Partners', link: '/contact', cta: 'Get in Touch' },
            ].map((audience) => (
              <div key={audience.title} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">{audience.title}</h3>
                <Link href={audience.link} className="block px-6 py-3 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold">
                  {audience.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-aurora transition">About Us</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-aurora transition">Contact</Link>
            <span>•</span>
            <Link href="/press" className="hover:text-aurora transition">Press Kit</Link>
            <span>•</span>
            <Link href="/careers" className="hover:text-aurora transition">Careers</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
