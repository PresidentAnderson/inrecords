import Link from 'next/link'

export default function Studio() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative p-12 py-24 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-full text-sm font-semibold mb-4">
              Montréal, QC
            </div>
            <h1 className="text-6xl font-playfair mb-6">IN Studio Montréal</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300 mb-8">
              Where artistry meets technology. A world-class creative HQ merging analog warmth, digital precision,
              and AI-powered innovation in the heart of Canada's music capital.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/book-session" className="px-8 py-4 bg-gold text-black rounded-full hover:opacity-90 transition font-semibold">
                Book a Session
              </Link>
              <Link href="#facilities" className="px-8 py-4 border-2 border-gold text-gold rounded-full hover:bg-gold/10 transition font-semibold">
                Explore Facilities
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '4', label: 'Recording Spaces' },
              { value: '24/7', label: 'Access Available' },
              { value: '96kHz', label: 'Audio Quality' },
              { value: '$75/hr', label: 'Starting Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-4xl font-bold text-gold mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Spaces */}
      <section id="facilities" className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Our Spaces</h2>
          <div className="space-y-16">
            {[
              {
                name: 'Control Room A',
                subtitle: 'Flagship Mixing & Mastering Suite',
                icon: '🎛️',
                description: 'Our flagship room featuring world-class acoustics, analog summing, and a hybrid workflow optimized for mixing and mastering.',
                features: [
                  'SSL AWS 948 Console (48-channel)',
                  'Barefoot MM27 Main Monitors',
                  'Genelec 8351B Nearfields',
                  'Universal Audio Apollo x16',
                  'Extensive outboard collection (API, Neve, SSL)',
                  'Acoustic treatment by Vicoustic'
                ],
                specs: '400 sq ft • Dolby Atmos • 96kHz/32-bit',
                rate: '$150/hr',
                image: '🎚️'
              },
              {
                name: 'Sound Lab',
                subtitle: 'Live Tracking & Production Hub',
                icon: '🎸',
                description: 'Spacious live room with isolated booths. Perfect for full band tracking, vocal sessions, and collaborative production.',
                features: [
                  'Live room: 600 sq ft with 16ft ceilings',
                  '3 isolation booths (drums, vocals, amp)',
                  'Neumann U87, AKG C414, Shure SM7B mic collection',
                  'Vintage Rhodes, Hammond B3, Moog synths',
                  'Pearl Masters drum kit',
                  'Guitar amp collection (Fender, Marshall, Vox)'
                ],
                specs: '900 sq ft • Natural reverb • Multi-room',
                rate: '$120/hr',
                image: '🎤'
              },
              {
                name: 'AI Suite',
                subtitle: 'Research & Adaptive Production Lab',
                icon: '🤖',
                description: 'Cutting-edge space integrating AI-powered tools, adaptive mastering research, and generative sound design experiments.',
                features: [
                  'Real-time adaptive mastering engine',
                  'Machine learning sound analysis tools',
                  'Generative MIDI & audio systems',
                  'Custom AI training workstation',
                  'Integration with Ableton/Logic via Max MSP',
                  'Dedicated GPU cluster for audio ML'
                ],
                specs: '300 sq ft • Research lab • AI-powered',
                rate: '$100/hr',
                image: '🔬'
              },
              {
                name: 'Immersive Listening Room',
                subtitle: 'Critical Listening & Client Showcase',
                icon: '🔊',
                description: 'Pristine acoustics designed for critical listening, mix review, and client presentations. The perfect environment to hear your work in truth.',
                features: [
                  'Genelec 7380A SAM system (7.1.4 Atmos)',
                  'Acoustic perfection: RT60 < 0.3s',
                  'Comfortable seating for 6',
                  'High-resolution playback system',
                  'Apple TV + streaming integration',
                  'Perfect for A&R listening sessions'
                ],
                specs: '350 sq ft • Dolby Atmos 7.1.4 • Tuned acoustics',
                rate: '$75/hr',
                image: '🎧'
              },
            ].map((space) => (
              <div key={space.name} className="grid md:grid-cols-2 gap-8 items-start">
                <div className="order-2 md:order-1">
                  <div className="text-5xl mb-4">{space.image}</div>
                  <h3 className="text-3xl font-semibold mb-2">{space.name}</h3>
                  <div className="text-gold font-semibold mb-4">{space.subtitle}</div>
                  <p className="text-gray-300 mb-6">{space.description}</p>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Equipment Highlights</h4>
                    <ul className="space-y-2">
                      {space.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm text-gray-400">
                          <span className="text-gold mr-2 flex-shrink-0">→</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {space.specs.split(' • ').map((spec) => (
                      <span key={spec} className="px-3 py-1 bg-white/5 rounded-full">{spec}</span>
                    ))}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-gradient-to-br from-gold/20 to-aurora/20 rounded-2xl p-8 border border-gold/30">
                    <div className="text-sm text-gray-400 mb-2">Hourly Rate</div>
                    <div className="text-4xl font-bold mb-4">{space.rate}</div>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Day Rate (8hrs)</span>
                        <span className="font-semibold">{parseInt(space.rate.replace(/\D/g, '')) * 6}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Week Rate (40hrs)</span>
                        <span className="font-semibold">{parseInt(space.rate.replace(/\D/g, '')) * 25}/week</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Academy Member</span>
                        <span className="font-semibold text-aurora">20% off</span>
                      </div>
                    </div>
                    <Link href={`/book?room=${space.name}`} className="block mt-6 text-center px-6 py-3 bg-gold text-black rounded-full hover:opacity-90 transition font-semibold">
                      Book {space.name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Services & Expertise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎵',
                title: 'Recording & Production',
                services: ['Full band tracking', 'Vocal production', 'Beat making sessions', 'Live instrumentation', 'Remote collaboration']
              },
              {
                icon: '🎚️',
                title: 'Mixing & Mastering',
                services: ['Stereo mixing', 'Dolby Atmos mixing', 'Analog summing', 'Mastering for streaming', 'Vinyl mastering prep']
              },
              {
                icon: '🎨',
                title: 'Sound Design & Post',
                services: ['Film/TV scoring', 'Podcast production', 'Audio branding', 'Game audio', 'Foley & SFX']
              },
            ].map((service) => (
              <div key={service.title} className="border border-gray-800 rounded-2xl p-8 hover:border-gold/50 transition">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <ul className="space-y-2">
                  {service.services.map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-400">
                      <span className="text-gold mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineers */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">Our Engineers</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Work with seasoned professionals who've shaped the sound of hundreds of releases across every genre.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Rivera',
                role: 'Senior Mix Engineer',
                credits: 'Credits: Drake, The Weeknd, 50+ gold records',
                specialty: ['Hip-Hop', 'R&B', 'Pop'],
                rate: '+$50/hr'
              },
              {
                name: 'Sarah Chen',
                role: 'Recording Engineer & Producer',
                credits: 'Berklee graduate, 10+ years in indie/electronic',
                specialty: ['Electronic', 'Indie', 'Experimental'],
                rate: '+$40/hr'
              },
              {
                name: 'Marcus "MK" Thompson',
                role: 'Mastering Engineer',
                credits: 'Former Abbey Road, vinyl cutting specialist',
                specialty: ['Mastering', 'Vinyl Prep', 'Restoration'],
                rate: '+$60/hr'
              },
            ].map((engineer) => (
              <div key={engineer.name} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold mb-1">{engineer.name}</h3>
                <div className="text-gold font-semibold mb-3">{engineer.role}</div>
                <p className="text-sm text-gray-400 mb-4">{engineer.credits}</p>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-2">
                    {engineer.specialty.map((spec) => (
                      <span key={spec} className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gold font-semibold">{engineer.rate}</span> with engineer
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Info */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Booking Information</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">What to Expect</h3>
              <div className="space-y-6">
                {[
                  {
                    title: 'Pre-Session Consultation',
                    description: '15-minute call to discuss your project goals, technical needs, and session logistics.'
                  },
                  {
                    title: 'Session Day Preparation',
                    description: 'We prep the room, test all equipment, and have your preferred setup ready when you arrive.'
                  },
                  {
                    title: 'Flexible Session Times',
                    description: 'Book hourly, daily, or weekly blocks. Need overnight access? We can accommodate that too.'
                  },
                  {
                    title: 'Post-Session Support',
                    description: 'Access to project files, backup storage, and engineer follow-up for revisions.'
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6">Policies & Amenities</h3>
              <div className="space-y-4">
                <div className="border border-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-gold">✓ Included</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• High-speed WiFi & Ethernet</li>
                    <li>• Coffee, tea, and snacks</li>
                    <li>• Parking validation</li>
                    <li>• Session file backup</li>
                    <li>• Instrument/amp collection</li>
                  </ul>
                </div>
                <div className="border border-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold mb-2 text-gold">📋 Policies</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• 24hr cancellation notice</li>
                    <li>• 50% deposit to secure booking</li>
                    <li>• Academy members: 20% discount</li>
                    <li>• Block booking discounts available</li>
                    <li>• Overnight rates negotiable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Recent Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                artist: 'Luna Vega',
                project: 'Midnight Dreams EP',
                room: 'Control Room A',
                description: 'Full mix and Atmos mastering for indie-electronic debut EP.',
                link: '/portfolio/luna-vega'
              },
              {
                artist: 'The Frequency Collective',
                project: 'Live Session Series',
                room: 'Sound Lab',
                description: 'Multi-day live tracking for 8-piece jazz-fusion ensemble.',
                link: '/portfolio/frequency-collective'
              },
              {
                artist: 'AI Lab x Berklee',
                project: 'Adaptive Mastering Research',
                room: 'AI Suite',
                description: 'Collaborative research on ML-powered dynamic mastering algorithms.',
                link: '/research/adaptive-mastering'
              },
            ].map((project) => (
              <div key={project.project} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-gold/50 transition">
                <div className="text-sm text-gold mb-2">{project.room}</div>
                <h3 className="text-xl font-semibold mb-1">{project.artist}</h3>
                <div className="text-gray-400 mb-3">{project.project}</div>
                <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                <Link href={project.link} className="text-sm text-aurora hover:underline">
                  View Project →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Ready to Create?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Book your session today and experience the intersection of artistry and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/book-session" className="px-10 py-4 bg-gold text-black rounded-full hover:opacity-80 transition font-bold text-lg">
              Book a Session
            </Link>
            <Link href="/studio-tour" className="px-10 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-bold text-lg">
              Schedule a Tour
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/studio-faq" className="hover:text-gold transition">Studio FAQ</Link>
            <span>•</span>
            <Link href="/equipment-list" className="hover:text-gold transition">Full Equipment List</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gold transition">Contact Studio Manager</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
