import Link from 'next/link'

export default function AILab() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section - Cinematic */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(1400px 700px at 30% 30%, rgba(0,153,255,0.3), transparent),
                       radial-gradient(1200px 600px at 70% 50%, rgba(138,43,226,0.25), transparent),
                       radial-gradient(900px 600px at 50% 90%, rgba(255,165,0,0.2), rgba(0,0,0,0.95))`
        }}
      >
        {/* Animated Background Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(0,153,255,0.03) 0px, transparent 2px, transparent 4px, rgba(0,153,255,0.03) 6px),
                             repeating-linear-gradient(90deg, rgba(0,153,255,0.03) 0px, transparent 2px, transparent 4px, rgba(0,153,255,0.03) 6px)`,
            animation: 'pulse 4s ease-in-out infinite'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-aurora/20 border border-aurora/30 rounded-full text-aurora text-sm font-semibold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-aurora rounded-full animate-pulse"></span>
              Research & Innovation
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-playfair mb-8 leading-tight">
            Machines That Listen<br />Like Producers
          </h1>

          <p className="text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed">
            Exploring adaptive mastering, generative soundscapes, and artist-centered AI systems
            redefining how music is made and experienced.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="#research" className="px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition font-semibold text-lg">
              Discover Research
            </Link>
            <Link href="#demos" className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-semibold text-lg">
              Listen to Demos
            </Link>
            <Link href="#join" className="px-8 py-4 border-2 border-aurora text-aurora rounded-full hover:bg-aurora/10 transition font-semibold text-lg">
              Join the Lab
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="p-12 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-8">Bridging Artistry & Intelligence</h2>
          <p className="text-2xl text-gray-300 leading-relaxed mb-6">
            INRecords AI Lab bridges artistry and machine intelligence.
          </p>
          <p className="text-xl text-gray-400 leading-relaxed">
            We research how sound, emotion, and technology converge — crafting systems that <em className="text-aurora">feel the mix</em>, not just analyze it.
          </p>
        </div>
      </section>

      {/* Research Focus Areas */}
      <section id="research" className="p-12 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-playfair mb-16 text-center">Research Focus Areas</h2>

          <div className="space-y-20">
            {/* Adaptive Mastering */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-6xl mb-6">🎚️</div>
                <h3 className="text-4xl font-semibold mb-4">Adaptive Mastering</h3>
                <p className="text-xl text-gray-300 mb-6">
                  Real-time mastering tuned to genre, mood, and emotion.
                </p>
                <p className="text-gray-400 mb-8">
                  Our mastering models learn from human producers — balancing tone, depth, and energy dynamically.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Emotion mapping',
                    'Neural transient shaping',
                    'Adaptive limiter feedback loops'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-aurora/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-aurora text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/research/adaptive-mastering" className="inline-block px-6 py-3 bg-aurora/20 text-aurora border border-aurora/30 rounded-full hover:bg-aurora/30 transition font-semibold">
                  Try Adaptive Demo →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-aurora/10 to-purple-500/10 rounded-3xl p-8 border border-aurora/20 backdrop-blur-sm">
                <div className="aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎵</div>
                    <p className="text-gray-400 text-sm">Interactive waveform demo</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-bold text-aurora">-14</div>
                    <div className="text-xs text-gray-500">LUFS</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-bold text-aurora">92%</div>
                    <div className="text-xs text-gray-500">Warmth</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-bold text-aurora">8.2</div>
                    <div className="text-xs text-gray-500">Energy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generative Soundscapes */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-3xl p-8 border border-purple-500/20 backdrop-blur-sm">
                  <div className="aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute bg-purple-500/30 rounded-full"
                          style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative text-center z-10">
                      <div className="text-5xl mb-4">🌊</div>
                      <p className="text-gray-400 text-sm">Infinite audio generation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="text-6xl mb-6">🌌</div>
                <h3 className="text-4xl font-semibold mb-4">Generative Soundscapes</h3>
                <p className="text-xl text-gray-300 mb-6">
                  Ambient and dynamic systems for film, wellness, and games.
                </p>
                <p className="text-gray-400 mb-8">
                  Composing endless atmospheres driven by narrative tension, biometrics, or player emotion.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Generative synthesis',
                    'Context-aware looping',
                    'Multimodal storytelling cues'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/research/soundscapes" className="inline-block px-6 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full hover:bg-purple-500/30 transition font-semibold">
                  Hear Soundscape Examples →
                </Link>
              </div>
            </div>

            {/* Dataset Curation */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-6xl mb-6">🧬</div>
                <h3 className="text-4xl font-semibold mb-4">Dataset Curation</h3>
                <p className="text-xl text-gray-300 mb-6">
                  Ethical, artist-first datasets for training next-gen models.
                </p>
                <p className="text-gray-400 mb-8">
                  We collaborate with creators who own their masters — ensuring every dataset honors rights, consent, and provenance.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Transparent data lineage',
                    'Artist licensing agreements',
                    'Diversity & bias reduction'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/research/datasets" className="inline-block px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-full hover:bg-gold/30 transition font-semibold">
                  Contribute Your Dataset →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-gold/10 to-orange-500/10 rounded-3xl p-8 border border-gold/20 backdrop-blur-sm">
                <div className="space-y-4">
                  {[
                    { label: 'Artists Compensated', value: '247', color: 'gold' },
                    { label: 'Hours of Audio', value: '12.4K', color: 'gold' },
                    { label: 'Genres Represented', value: '38', color: 'gold' },
                    { label: 'Ethical Compliance', value: '100%', color: 'gold' }
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center bg-black/40 rounded-lg p-4 border border-white/5">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research Table */}
      <section className="p-12 py-24 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Featured Research</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Project</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Description</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    project: 'Adaptive EQ v1.2',
                    description: 'Emotion-aware equalizer that adjusts to perceived warmth & brightness',
                    status: 'In Beta',
                    statusColor: 'aurora'
                  },
                  {
                    project: 'Latent Timbre Map',
                    description: 'Model clustering emotional timbres across genres',
                    status: 'Published',
                    statusColor: 'gold'
                  },
                  {
                    project: 'Infinite Horizon',
                    description: 'Procedural ambient engine for interactive media',
                    status: 'Ongoing',
                    statusColor: 'purple-400'
                  }
                ].map((research) => (
                  <tr key={research.project} className="border-b border-gray-800/50 hover:bg-white/5 transition">
                    <td className="py-4 px-6 font-semibold">{research.project}</td>
                    <td className="py-4 px-6 text-gray-400">{research.description}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${research.statusColor}/20 text-${research.statusColor} border border-${research.statusColor}/30`}>
                        {research.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Link href="/research/all" className="text-aurora hover:underline font-semibold">
              View All Research →
            </Link>
          </div>
        </div>
      </section>

      {/* Audio Demos */}
      <section id="demos" className="p-12 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-playfair mb-6 text-center">Audio Demos</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Hear how adaptive mastering responds to emotion in real time.
          </p>

          <div className="bg-white/5 rounded-3xl p-10 border border-white/10 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Raw Mix</h3>
                <div className="bg-black/60 rounded-xl p-6 border border-white/10 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎵</div>
                    <p className="text-gray-400 text-sm">Waveform visualization</p>
                    <p className="text-gray-500 text-xs mt-2">Unprocessed audio</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <button className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">▶ Play</button>
                  <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">↓</button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">AI-Mastered</h3>
                <div className="bg-gradient-to-br from-aurora/20 to-purple-500/20 rounded-xl p-6 border border-aurora/30 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-gray-400 text-sm">Adaptive processing</p>
                    <p className="text-aurora text-xs mt-2 font-semibold">Real-time mastering applied</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <button className="flex-1 px-4 py-2 bg-aurora/20 border border-aurora/30 text-aurora rounded-lg hover:bg-aurora/30 transition">▶ Play</button>
                  <button className="px-4 py-2 bg-aurora/20 border border-aurora/30 text-aurora rounded-lg hover:bg-aurora/30 transition">↓</button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-aurora font-semibold mb-1">+3.2 dB</div>
                <div className="text-gray-500">Perceived Loudness</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-aurora font-semibold mb-1">28% ↑</div>
                <div className="text-gray-500">Harmonic Richness</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-aurora font-semibold mb-1">15ms</div>
                <div className="text-gray-500">Processing Latency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborations */}
      <section className="p-12 py-24 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">We Work With Those Who Redefine Sound</h2>
          <p className="text-center text-gray-400 mb-12">
            Partnering with innovators across music technology, education, and research
          </p>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {[
              { name: 'Axai Innovation', type: 'Technology Partner' },
              { name: 'StudioNYNE', type: 'Production Partner' },
              { name: 'PVT Academy', type: 'Education Partner' },
              { name: 'Concordia Research Hub', type: 'Academic Partner' }
            ].map((partner) => (
              <div key={partner.name} className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center hover:border-aurora/50 transition">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-semibold mb-2">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.type}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/partnerships" className="inline-block px-8 py-4 bg-aurora/20 text-aurora border border-aurora/30 rounded-full hover:bg-aurora/30 transition font-semibold">
              Partner with Us →
            </Link>
          </div>
        </div>
      </section>

      {/* Ethics & Transparency */}
      <section className="p-12 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">⚖️</div>
            <h2 className="text-5xl font-playfair mb-6">Ethics & Transparency</h2>
          </div>

          <div className="bg-white/5 rounded-3xl p-12 border border-white/10 backdrop-blur-sm">
            <div className="space-y-8 text-center max-w-3xl mx-auto">
              <p className="text-2xl text-gray-200 leading-relaxed">
                We build models that respect creators and culture.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                Every dataset is audited for ownership, bias, and integrity.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                We reject black-box training — our AI <span className="text-aurora font-semibold">listens with humans</span>, not instead of them.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <Link href="/ethics-framework" className="px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition font-semibold">
                Ethical Framework →
              </Link>
              <Link href="/transparency-report" className="px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition font-semibold">
                Transparency Report →
              </Link>
              <Link href="/open-research" className="px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition font-semibold">
                Open Research →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Lab */}
      <section id="join" className="p-12 py-24 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Join the Lab</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Want to experiment, publish, or co-develop with us?<br />
            Apply for residency or contribute to open research.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Apply for Residency',
                description: '3-6 month research positions for ML engineers, audio researchers, and creative technologists',
                cta: 'Apply Now',
                link: '/residency-application'
              },
              {
                title: 'Submit a Proposal',
                description: 'Have a research idea? Pitch collaborative projects and access our infrastructure',
                cta: 'Submit Proposal',
                link: '/submit-proposal'
              },
              {
                title: 'Join Discord',
                description: 'Connect with researchers, share experiments, and participate in open discussions',
                cta: 'Join Community',
                link: '/discord'
              }
            ].map((option) => (
              <div key={option.title} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-aurora/50 transition">
                <h3 className="text-xl font-semibold mb-4">{option.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{option.description}</p>
                <Link href={option.link} className="inline-block px-6 py-3 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold w-full">
                  {option.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-gray-500 text-sm">
            Questions? <Link href="/contact-research" className="text-aurora hover:underline">Contact the research team</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-midnight border-t border-gray-800 p-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-playfair mb-4">inRECORD</h3>
              <p className="text-gray-500 text-sm">Where Independence Sounds Infinite</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Partners</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>StudioNYNE</li>
                <li>Axai Innovation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <Link href="/legal" className="block text-gray-500 hover:text-aurora transition">Legal</Link>
                <Link href="/contact" className="block text-gray-500 hover:text-aurora transition">Contact</Link>
                <Link href="/careers" className="block text-gray-500 hover:text-aurora transition">Careers</Link>
                <Link href="/dao" className="block text-gray-500 hover:text-aurora transition">DAO Portal</Link>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2025 INRecords — Where Independence Sounds Infinite
          </div>
        </div>
      </footer>
    </div>
  )
}
