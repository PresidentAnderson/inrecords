import Link from 'next/link'

export default function DAO() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section
        className="relative p-12 py-24"
        style={{
          background: 'linear-gradient(180deg, #0B0B0B 0%, #0B0B0B 40%, #0d1321 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-playfair mb-6">inRECORD DAO</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300 mb-8">
              The world's first fan-powered record label. Where community ownership meets musical innovation.
              Vote, fund, and shape the future of independent music.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/join-dao" className="px-8 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold">
                Join the DAO
              </Link>
              <Link href="#how-it-works" className="px-8 py-4 border-2 border-aurora text-aurora rounded-full hover:bg-aurora/10 transition font-semibold">
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '2,847', label: 'Active Members' },
              { value: '$127K', label: 'Treasury Value' },
              { value: '43', label: 'Proposals Passed' },
              { value: '89%', label: 'Voter Participation' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-4xl font-bold text-aurora mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="bg-black p-12 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">What Members Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🗳️',
                title: 'Governance & Voting',
                description: 'Vote on release schedules, artwork selection, collaboration partners, and label strategy. Every token holder has a voice.',
                features: ['Release decisions', 'A&R input', 'Budget allocation', 'Partnership votes']
              },
              {
                icon: '💰',
                title: 'Project Funding',
                description: 'Pool resources to fund vinyl pressings, music videos, studio sessions, and artist tours. Back what you believe in.',
                features: ['Crowdfund releases', 'Support artists', 'Earn revenue share', 'Special editions']
              },
              {
                icon: '🎵',
                title: 'Exclusive Access',
                description: 'Token-gated content including stems, behind-the-scenes footage, early releases, and members-only events.',
                features: ['Unreleased tracks', 'Studio sessions', 'Virtual meetups', 'Master stems']
              },
            ].map((capability) => (
              <div key={capability.title} className="rounded-2xl p-8 border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-aurora/50 transition">
                <div className="text-5xl mb-4">{capability.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{capability.title}</h3>
                <p className="text-gray-300 mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-400">
                      <span className="text-aurora mr-2">→</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-black to-midnight p-12 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">How It Works</h2>
          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Acquire $RECORD Tokens',
                description: 'Purchase tokens through our platform or earn them by contributing to the community. Tokens represent voting power and revenue share.',
                details: ['Initial sale: 0.1 ETH per 100 tokens', 'Max supply: 1,000,000 tokens', 'Artist pool: 30%', 'Community treasury: 40%']
              },
              {
                step: '02',
                title: 'Participate in Governance',
                description: 'Submit proposals, discuss in forums, and cast votes on important label decisions. Proposals require 1% quorum to pass.',
                details: ['7-day discussion period', '3-day voting window', 'Simple majority wins', 'Transparent on-chain records']
              },
              {
                step: '03',
                title: 'Fund Projects & Earn',
                description: 'Back specific projects you believe in. When releases generate revenue, token holders receive proportional distributions.',
                details: ['70% to artists', '20% to backers', '10% to treasury', 'Quarterly distributions']
              },
              {
                step: '04',
                title: 'Access Exclusive Content',
                description: 'Unlock token-gated content based on your holdings. Higher tiers unlock more exclusive experiences and opportunities.',
                details: ['Bronze: 100+ tokens', 'Silver: 500+ tokens', 'Gold: 1,000+ tokens', 'Platinum: 5,000+ tokens']
              },
            ].map((step, index) => (
              <div key={step.step} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-24 h-24 rounded-full bg-aurora/20 border-2 border-aurora flex items-center justify-center">
                  <span className="text-3xl font-bold text-aurora">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-300 mb-4">{step.description}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {step.details.map((detail) => (
                      <div key={detail} className="flex items-center text-sm text-gray-400 bg-white/5 rounded-lg px-4 py-2">
                        <span className="text-gold mr-2">✓</span>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Proposals */}
      <section className="bg-midnight p-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-playfair">Active Proposals</h2>
            <Link href="/proposals" className="text-aurora hover:underline">View All →</Link>
          </div>
          <div className="space-y-6">
            {[
              {
                id: 'PROP-047',
                title: 'Fund "Midnight Sessions" Live Album Production',
                author: 'StudioNYNE',
                status: 'Active',
                timeLeft: '3 days',
                votes: { for: 1847, against: 234 },
                description: 'Proposal to allocate $15K from treasury for recording and producing a live album featuring DAO member artists.'
              },
              {
                id: 'PROP-048',
                title: 'Partnership with SoundScape Festival 2026',
                author: 'PresidentAnderson',
                status: 'Active',
                timeLeft: '5 days',
                votes: { for: 2104, against: 89 },
                description: 'Establish official partnership for label showcase stage, including artist lineup curation by DAO vote.'
              },
              {
                id: 'PROP-049',
                title: 'Launch Remix Bounty Program',
                author: 'LexChronos',
                status: 'Discussion',
                timeLeft: '7 days',
                votes: { for: 0, against: 0 },
                description: 'Create incentive program for community remixes with $500 bounties per approved remix, funded quarterly.'
              },
            ].map((proposal) => (
              <div key={proposal.id} className="rounded-2xl p-6 bg-black/60 border border-white/10 hover:border-aurora/30 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-400">{proposal.id}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        proposal.status === 'Active' ? 'bg-aurora/20 text-aurora' : 'bg-gold/20 text-gold'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">by {proposal.author}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Time Left</div>
                    <div className="text-lg font-semibold">{proposal.timeLeft}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{proposal.description}</p>
                {proposal.votes.for > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">For: {proposal.votes.for}</span>
                      <span className="text-red-400">Against: {proposal.votes.against}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-aurora h-2 rounded-full"
                        style={{ width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treasury & Financials */}
      <section className="bg-gradient-to-b from-midnight to-black p-12 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Treasury Transparency</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-8 bg-white/5 border border-white/10">
              <h3 className="text-2xl font-semibold mb-6">Asset Allocation</h3>
              <div className="space-y-4">
                {[
                  { asset: 'ETH', amount: '45.2', value: '$127,400', percent: 65 },
                  { asset: 'USDC', amount: '28,500', value: '$28,500', percent: 22 },
                  { asset: 'Revenue Pool', amount: 'N/A', value: '$17,300', percent: 13 },
                ].map((item) => (
                  <div key={item.asset}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{item.asset}</span>
                      <span className="text-gray-400">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-aurora h-2 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-8 bg-white/5 border border-white/10">
              <h3 className="text-2xl font-semibold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { type: 'Funded', project: 'Vinyl Pressing - Vol. 3', amount: '-$8,500', date: '2 days ago' },
                  { type: 'Revenue', project: 'Streaming Q4 2025', amount: '+$12,340', date: '5 days ago' },
                  { type: 'Funded', project: 'Studio Session Grant', amount: '-$3,000', date: '1 week ago' },
                  { type: 'Deposit', project: 'Token Sale Round 3', amount: '+$45,000', date: '2 weeks ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/5">
                    <div>
                      <div className="text-sm font-semibold">{activity.project}</div>
                      <div className="text-xs text-gray-400">{activity.date}</div>
                    </div>
                    <div className={`font-semibold ${activity.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {activity.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="bg-black p-12 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Membership Tiers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                tier: 'Bronze',
                tokens: '100+',
                color: 'from-orange-600 to-orange-800',
                benefits: ['Vote on proposals', 'Forum access', 'Quarterly updates', 'Basic token-gated content']
              },
              {
                tier: 'Silver',
                tokens: '500+',
                color: 'from-gray-400 to-gray-600',
                benefits: ['All Bronze perks', 'Early release access', 'Monthly AMAs', 'Exclusive merch discounts']
              },
              {
                tier: 'Gold',
                tokens: '1,000+',
                color: 'from-gold to-yellow-600',
                benefits: ['All Silver perks', 'Studio tour access', 'Stem downloads', 'VIP event invites']
              },
              {
                tier: 'Platinum',
                tokens: '5,000+',
                color: 'from-aurora to-blue-600',
                benefits: ['All Gold perks', '1-on-1 artist sessions', 'Producer credits', 'Advisory board seat']
              },
            ].map((tier) => (
              <div key={tier.tier} className="rounded-2xl overflow-hidden border border-white/10 hover:scale-105 transition">
                <div className={`bg-gradient-to-br ${tier.color} p-6 text-center`}>
                  <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                  <div className="text-sm opacity-90">{tier.tokens} tokens</div>
                </div>
                <div className="bg-black/80 p-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start text-sm">
                        <span className="text-aurora mr-2 flex-shrink-0">✓</span>
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-gradient-to-b from-black to-midnight p-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of music history. Own a piece of the label. Shape the future of independent music.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/join-dao" className="px-10 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-bold text-lg">
              Join the DAO
            </Link>
            <Link href="/whitepaper" className="px-10 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-bold text-lg">
              Read Whitepaper
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/faq" className="hover:text-aurora transition">FAQ</Link>
            <span>•</span>
            <Link href="/governance" className="hover:text-aurora transition">Governance Docs</Link>
            <span>•</span>
            <Link href="/community" className="hover:text-aurora transition">Community Forum</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
