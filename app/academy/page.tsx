'use client'

import Link from 'next/link'

export default function Academy() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white p-12 py-24 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-aurora/10 text-aurora rounded-full text-sm font-semibold mb-4">
                Applications Open
              </div>
              <h1 className="text-6xl font-playfair mb-6 leading-tight">inRECORD Academy</h1>
              <p className="text-xl text-gray-700 mb-8">
                Empowering independent artists through world-class mentorship, production labs, and business literacy.
                Develop your sound, build your brand, and own your career.
              </p>
              <div className="flex gap-4">
                <Link href="/apply" className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-900 transition font-semibold">
                  Apply Now
                </Link>
                <Link href="#curriculum" className="px-8 py-4 border-2 border-black text-black rounded-full hover:bg-black hover:text-white transition font-semibold">
                  View Curriculum
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl font-bold text-aurora mb-2">12 Weeks</div>
                <div className="text-gray-600">Intensive Program</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl font-bold text-gold mb-2">20 Artists</div>
                <div className="text-gray-600">Per Cohort</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl font-bold text-black mb-2">$2,500</div>
                <div className="text-gray-600">Full Scholarship Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="p-12 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">What You'll Master</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎹',
                title: 'Songcraft & Production',
                description: 'From bedroom to boardroom-ready. Master arrangement, mixing, and the art of finishing tracks that move people.',
                modules: [
                  'DAW mastery (Ableton, Logic, FL Studio)',
                  'Arrangement & structure analysis',
                  'Mixing fundamentals & ear training',
                  'Collaboration workflows',
                  'Genre-specific production techniques'
                ]
              },
              {
                icon: '🎨',
                title: 'Brand & Release Strategy',
                description: 'Build a brand that resonates. Learn positioning, storytelling, rollout strategy, and press that cuts through the noise.',
                modules: [
                  'Artist identity & visual branding',
                  'Release strategy & rollout planning',
                  'Press kit development',
                  'Social media & content strategy',
                  'Playlist pitching & DSP optimization'
                ]
              },
              {
                icon: '⚖️',
                title: 'Rights & Royalties',
                description: 'Own your career. LexChronos demystifies contracts, splits, licensing, and how to get paid what you're worth.',
                modules: [
                  'Copyright & ownership fundamentals',
                  'Publishing vs master rights',
                  'Split sheets & collaboration agreements',
                  'Licensing opportunities (sync, samples)',
                  'Revenue streams & royalty collection'
                ]
              },
            ].map((pillar) => (
              <div key={pillar.title} className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-aurora transition">
                <div className="text-5xl mb-4">{pillar.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{pillar.title}</h3>
                <p className="text-gray-600 mb-6">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.modules.map((module) => (
                    <li key={module} className="flex items-start text-sm text-gray-700">
                      <span className="text-aurora mr-2 flex-shrink-0">→</span>
                      <span>{module}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Your Mentors */}
      <section className="p-12 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">Meet Your Mentors</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Learn from industry veterans who've built careers on their own terms. Real artists, real experience, real guidance.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'President Anderson',
                role: 'Label Founder & A&R',
                bio: 'Former major-label A&R turned independent advocate. 15+ years discovering, developing, and launching artists across hip-hop, R&B, and electronic music.',
                expertise: ['A&R Strategy', 'Artist Development', 'Label Operations', 'Industry Navigation'],
                image: '🎯'
              },
              {
                name: 'StudioNYNE',
                role: 'Producer & Sound Designer',
                bio: 'Multi-platinum producer with credits across 50+ releases. Specializes in hybrid analog-digital workflows and teaching artists to trust their ears.',
                expertise: ['Production Techniques', 'Mixing & Mastering', 'Sound Design', 'Studio Workflows'],
                image: '🎚️'
              },
              {
                name: 'LexChronos',
                role: 'Music Attorney & Rights Specialist',
                bio: 'Entertainment lawyer with 10+ years protecting independent artists. Passionate about demystifying contracts and empowering creators with knowledge.',
                expertise: ['Music Law', 'Contract Negotiation', 'Copyright & Publishing', 'Revenue Optimization'],
                image: '⚖️'
              },
            ].map((mentor) => (
              <div key={mentor.name} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-aurora transition">
                <div className="text-6xl mb-4">{mentor.image}</div>
                <h3 className="text-2xl font-semibold mb-1">{mentor.name}</h3>
                <div className="text-aurora font-semibold mb-4">{mentor.role}</div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{mentor.bio}</p>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Deep Dive */}
      <section id="curriculum" className="p-12 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">12-Week Curriculum</h2>
          <div className="space-y-6">
            {[
              {
                weeks: 'Weeks 1-3',
                title: 'Foundation & Identity',
                focus: 'Sonic Signature',
                description: 'Discover your unique sound and artistic identity. Deep-dive into influences, set production goals, and establish your creative process.',
                deliverables: ['Artist vision statement', 'Reference track analysis', '3 finished demos', 'Brand mood board']
              },
              {
                weeks: 'Weeks 4-6',
                title: 'Production Mastery',
                focus: 'Technical Excellence',
                description: 'Level up your production chops. Hands-on studio sessions covering arrangement, mixing techniques, and the art of finishing tracks.',
                deliverables: ['2 radio-ready singles', 'Mix feedback sessions', 'Collaboration project', 'Production workflow doc']
              },
              {
                weeks: 'Weeks 7-9',
                title: 'Brand & Strategy',
                focus: 'Market Positioning',
                description: 'Build your brand and plan your rollout. Create press assets, develop your visual identity, and craft a release strategy that gets noticed.',
                deliverables: ['Complete press kit', 'Release strategy plan', 'Social content calendar', '3 music videos/visualizers']
              },
              {
                weeks: 'Weeks 10-12',
                title: 'Business & Rights',
                focus: 'Career Ownership',
                description: 'Master the business side. Learn contracts, splits, licensing, and how to build sustainable revenue streams as an independent artist.',
                deliverables: ['Rights & splits audit', 'Revenue optimization plan', 'Contract templates', 'Final project showcase']
              },
            ].map((phase, index) => (
              <div key={phase.weeks} className="relative">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-aurora text-white flex items-center justify-center font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-8 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-aurora font-semibold mb-1">{phase.weeks}</div>
                        <h3 className="text-2xl font-semibold mb-2">{phase.title}</h3>
                        <div className="inline-block px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-semibold">
                          {phase.focus}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6">{phase.description}</p>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 mb-3">Key Deliverables</div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {phase.deliverables.map((deliverable) => (
                          <div key={deliverable} className="flex items-center text-sm text-gray-700 bg-white rounded-lg px-4 py-2 border border-gray-200">
                            <span className="text-aurora mr-2">✓</span>
                            {deliverable}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="p-12 py-20 bg-gradient-to-br from-aurora/5 to-gold/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Alumni Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Aria Chen',
                cohort: 'Cohort 3',
                achievement: '500K+ Spotify Streams',
                quote: 'The Academy taught me that being independent doesn't mean being alone. The production and business skills I learned here changed everything.',
                outcome: 'Signed sync deal for Netflix series'
              },
              {
                name: 'Marcus "MK" Johnson',
                cohort: 'Cohort 5',
                achievement: 'Record Deal + Tour',
                quote: 'LexChronos helped me negotiate a deal that actually made sense for my career. I kept my masters and doubled my advance.',
                outcome: '20-city North American tour'
              },
              {
                name: 'Luna Vega',
                cohort: 'Cohort 6',
                achievement: 'Label Founder',
                quote: 'I came to learn. I left ready to build. Now I run my own boutique label using everything the Academy taught me.',
                outcome: 'Launched imprint with 5 artists'
              },
            ].map((story) => (
              <div key={story.name} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-1">{story.name}</h3>
                  <div className="text-sm text-gray-500">{story.cohort}</div>
                </div>
                <div className="inline-block px-4 py-2 bg-aurora/10 text-aurora rounded-full text-sm font-semibold mb-4">
                  {story.achievement}
                </div>
                <p className="text-gray-700 italic mb-4">"{story.quote}"</p>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Post-Academy</div>
                  <div className="text-sm font-semibold text-black">{story.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section className="p-12 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Program Details</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {[
                    '36 hours of live instruction & mentorship',
                    'Weekly 1-on-1 sessions with mentors',
                    'Full access to IN Studio Montréal',
                    'Production software & plugin licenses',
                    'Legal template library (contracts, splits)',
                    'Lifetime alumni network access',
                    'Release support & distribution credits',
                    'Final showcase performance opportunity'
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="text-aurora mr-3 flex-shrink-0 mt-1">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Application Requirements</h3>
                <ul className="space-y-3">
                  {[
                    '3-5 original tracks (any stage of completion)',
                    'Artist bio & vision statement (500 words)',
                    'Social media presence (not required to be large)',
                    'Video introduction (2-3 minutes)',
                    'Commitment to full 12-week program',
                    'Open mind & willingness to collaborate'
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="text-gold mr-3 flex-shrink-0 mt-1">→</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-aurora/10 to-gold/10 rounded-2xl p-6 border border-aurora/20">
                <h3 className="text-xl font-semibold mb-2">Scholarship Opportunities</h3>
                <p className="text-gray-700 mb-4">
                  50% of spots reserved for underrepresented artists. Full & partial scholarships available based on financial need.
                </p>
                <Link href="/scholarship" className="text-aurora font-semibold hover:underline">
                  Learn about scholarships →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Timeline */}
      <section className="p-12 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Cohort 8 Timeline</h2>
          <div className="space-y-4">
            {[
              { date: 'Jan 15 - Feb 28', event: 'Applications Open', status: 'active' },
              { date: 'Mar 1 - Mar 15', event: 'Application Review & Interviews', status: 'upcoming' },
              { date: 'Mar 20', event: 'Acceptance Notifications', status: 'upcoming' },
              { date: 'Apr 7 - Jun 27', event: 'Program Runs (12 Weeks)', status: 'upcoming' },
              { date: 'Jun 28', event: 'Final Showcase & Graduation', status: 'upcoming' },
            ].map((milestone) => (
              <div key={milestone.date} className="flex items-center gap-6 bg-white rounded-xl p-6 border border-gray-200">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                  milestone.status === 'active' ? 'bg-aurora animate-pulse' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="font-semibold">{milestone.event}</div>
                  <div className="text-sm text-gray-500">{milestone.date}</div>
                </div>
                {milestone.status === 'active' && (
                  <span className="px-4 py-2 bg-aurora/10 text-aurora rounded-full text-sm font-semibold">
                    Open Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="p-12 py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Your Music. Your Career. Your Terms.</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the next generation of independent artists who are building sustainable careers without compromise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/apply" className="px-10 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-bold text-lg">
              Start Your Application
            </Link>
            <Link href="/academy-info-session" className="px-10 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-bold text-lg">
              Attend Info Session
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/academy-faq" className="hover:text-aurora transition">Academy FAQ</Link>
            <span>•</span>
            <Link href="/curriculum-full" className="hover:text-aurora transition">Full Curriculum</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-aurora transition">Contact Admissions</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
