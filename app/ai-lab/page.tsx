import Link from 'next/link'

export default function AILab() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section
        className="relative p-12 py-24"
        style={{
          background: `radial-gradient(1200px 600px at 20% 20%, rgba(0,153,255,0.25), transparent),
                       radial-gradient(1000px 600px at 80% 30%, rgba(255,0,149,0.22), transparent),
                       radial-gradient(800px 600px at 50% 80%, rgba(255,165,0,0.18), rgba(0,0,0,0.8))`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-aurora/20 text-aurora rounded-full text-sm font-semibold mb-4">
              Research & Innovation
            </div>
            <h1 className="text-6xl font-playfair mb-6">inRECORD AI Lab</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-200 mb-8">
              Where machine learning meets musical intuition. Exploring adaptive mastering, generative soundscapes,
              and the future of human-AI collaboration in music production.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/research" className="px-8 py-4 bg-white text-black rounded-full hover:bg-gray-200 transition font-semibold">
                Explore Research
              </Link>
              <Link href="#projects" className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-semibold">
                View Projects
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '8', label: 'Active Research Projects' },
              { value: '15+', label: 'Academic Partnerships' },
              { value: '120K', label: 'Training Hours' },
              { value: 'Open', label: 'Source Tools' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-4xl font-bold text-aurora mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-playfair mb-6">Our Mission</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            We believe AI should amplify human creativity, not replace it. The inRECORD AI Lab develops
            ethical, artist-first tools that enhance musical expression while respecting artistic intent,
            copyright, and the irreplaceable value of human intuition.
          </p>
        </div>
      </section>

      {/* Core Research Areas */}
      <section id="projects" className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Research Areas</h2>
          <div className="space-y-12">
            {[
              {
                icon: '🎚️',
                title: 'Adaptive Mastering',
                tagline: 'Machines That Listen Like Producers',
                description: 'Real-time mastering engine that analyzes genre, emotion, and loudness standards to apply context-aware processing. Learns from your references and adapts to your artistic vision.',
                features: [
                  'Genre-aware EQ & dynamics',
                  'Reference track matching',
                  'Streaming platform optimization',
                  'Emotion-based parameter tuning',
                  'A/B comparison engine'
                ],
                status: 'Beta Testing',
                partners: ['Berklee College', 'McGill University'],
                link: '/research/adaptive-mastering'
              },
              {
                icon: '🌊',
                title: 'Generative Soundscapes',
                tagline: 'Infinite Audio Environments',
                description: 'AI systems generating evolving ambient soundscapes for film, wellness apps, gaming, and installation art. Never-repeating, always coherent.',
                features: [
                  'Procedural audio generation',
                  'Emotion & scene adaptation',
                  'MIDI & audio output',
                  'Customizable parameters',
                  'Real-time interactive control'
                ],
                status: 'In Production',
                partners: ['Ubisoft Audio', 'Calm App'],
                link: '/research/generative-soundscapes'
              },
              {
                icon: '🧠',
                title: 'Stem Separation & Analysis',
                tagline: 'Deconstruct to Understand',
                description: 'Advanced source separation and audio analysis tools. Extract stems, analyze arrangement patterns, and learn from the greats.',
                features: [
                  'High-fidelity stem isolation',
                  'Arrangement analysis',
                  'Mixing technique extraction',
                  'Educational applications',
                  'Sample clearance assistance'
                ],
                status: 'Research Phase',
                partners: ['Sony Research', 'Splice'],
                link: '/research/stem-separation'
              },
              {
                icon: '📚',
                title: 'Ethical Dataset Curation',
                tagline: 'Artist-First Training Data',
                description: 'Building transparent, consensual datasets for audio ML training. Artists maintain control and receive compensation when their work trains models.',
                features: [
                  'Opt-in licensing platform',
                  'Transparent provenance tracking',
                  'Royalty distribution system',
                  'Copyright-safe training',
                  'Community governance'
                ],
                status: 'DAO Integration',
                partners: ['Creative Commons', 'OpenAI'],
                link: '/research/ethical-datasets'
              },
            ].map((project) => (
              <div key={project.title} className="bg-white/5 rounded-2xl p-10 border border-white/10 backdrop-blur-sm hover:border-aurora/50 transition">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-6xl mb-4">{project.icon}</div>
                    <h3 className="text-3xl font-semibold mb-2">{project.title}</h3>
                    <div className="text-aurora font-semibold mb-4">{project.tagline}</div>
                    <p className="text-gray-300 mb-6">{project.description}</p>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {project.features.map((feature) => (
                          <li key={feature} className="flex items-start text-sm text-gray-400">
                            <span className="text-aurora mr-2 flex-shrink-0">→</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={project.link} className="inline-flex items-center text-aurora hover:underline font-semibold">
                      Learn More →
                    </Link>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                      <div className="text-sm text-gray-400 mb-2">Status</div>
                      <div className="text-lg font-semibold text-aurora">{project.status}</div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                      <div className="text-sm text-gray-400 mb-3">Research Partners</div>
                      <div className="space-y-2">
                        {project.partners.map((partner) => (
                          <div key={partner} className="flex items-center text-sm">
                            <span className="text-gold mr-2">✓</span>
                            <span>{partner}</span>
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

      {/* Technology Stack */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Technology & Tools</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: 'Machine Learning',
                icon: '🤖',
                tools: ['PyTorch', 'TensorFlow', 'Librosa', 'OpenAI Whisper', 'Hugging Face Transformers']
              },
              {
                category: 'Audio Processing',
                icon: '🎵',
                tools: ['Max MSP', 'JUCE Framework', 'Essentia', 'Spleeter', 'AudioLDM']
              },
              {
                category: 'Infrastructure',
                icon: '⚙️',
                tools: ['NVIDIA A100 GPUs', 'AWS SageMaker', 'Docker', 'Kubernetes', 'MLflow']
              },
            ].map((stack) => (
              <div key={stack.category} className="border border-gray-800 rounded-2xl p-8 hover:border-aurora/50 transition">
                <div className="text-5xl mb-4">{stack.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{stack.category}</h3>
                <ul className="space-y-2">
                  {stack.tools.map((tool) => (
                    <li key={tool} className="text-sm text-gray-400 flex items-center">
                      <span className="text-aurora mr-2">→</span>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Team */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">Research Team</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Interdisciplinary team bridging music production, machine learning, and human-centered design.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: 'Dr. Elena Kozlov',
                role: 'ML Research Lead',
                background: 'PhD MIT CSAIL',
                focus: ['Deep Learning', 'Audio ML'],
                image: '🔬'
              },
              {
                name: 'James Park',
                role: 'Audio Engineer',
                background: 'Former Dolby Labs',
                focus: ['DSP', 'Real-time Systems'],
                image: '🎚️'
              },
              {
                name: 'Aisha Williams',
                role: 'UX Researcher',
                background: 'CMU HCI',
                focus: ['Human-AI Interaction', 'Creative Tools'],
                image: '🎨'
              },
              {
                name: 'Carlos Mendez',
                role: 'Data Scientist',
                background: 'Spotify Research',
                focus: ['MIR', 'Dataset Curation'],
                image: '📊'
              },
            ].map((member) => (
              <div key={member.name} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-5xl mb-4 text-center">{member.image}</div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <div className="text-aurora text-sm font-semibold mb-2">{member.role}</div>
                <div className="text-xs text-gray-500 mb-4">{member.background}</div>
                <div className="space-y-1">
                  {member.focus.map((area) => (
                    <div key={area} className="text-xs text-gray-400">
                      • {area}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications & Talks */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-12 text-center">Publications & Talks</h2>
          <div className="space-y-6">
            {[
              {
                type: 'Conference Paper',
                title: 'Adaptive Mastering: Genre-Aware Dynamic Range Processing via Deep Reinforcement Learning',
                venue: 'AES 154th Convention, 2024',
                authors: 'E. Kozlov, J. Park, et al.',
                link: '/papers/adaptive-mastering-2024.pdf'
              },
              {
                type: 'Workshop',
                title: 'Ethical AI in Music: Building Consensual Training Datasets',
                venue: 'ISMIR 2024 Workshop',
                authors: 'C. Mendez, A. Williams',
                link: '/papers/ethical-ai-ismir-2024.pdf'
              },
              {
                type: 'Keynote',
                title: 'The Future of Human-AI Collaboration in Music Production',
                venue: 'NAMM Show 2025',
                authors: 'President Anderson, Dr. E. Kozlov',
                link: '/talks/namm-2025-keynote'
              },
              {
                type: 'Journal Article',
                title: 'Generative Soundscapes for Interactive Media: A Procedural Approach',
                venue: 'Journal of Audio Engineering Society, Vol. 72',
                authors: 'J. Park, E. Kozlov',
                link: '/papers/generative-soundscapes-jaes.pdf'
              },
            ].map((pub) => (
              <div key={pub.title} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-aurora/30 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-block px-3 py-1 bg-aurora/20 text-aurora rounded-full text-xs font-semibold mb-3">
                      {pub.type}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                    <div className="text-sm text-gray-400 mb-1">{pub.venue}</div>
                    <div className="text-sm text-gray-500">{pub.authors}</div>
                  </div>
                  <Link href={pub.link} className="text-aurora hover:underline text-sm flex-shrink-0 ml-4">
                    Read →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="p-12 py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair mb-4 text-center">Open Source Contributions</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            We believe in open research. Many of our tools are available under permissive licenses for the community to build upon.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'inr-mastering',
                description: 'Adaptive mastering plugin (VST/AU) with genre-aware presets and real-time analysis.',
                language: 'C++/JUCE',
                stars: '2.4K',
                license: 'GPL-3.0',
                link: 'https://github.com/inrecords/inr-mastering'
              },
              {
                name: 'soundscape-gen',
                description: 'Generative soundscape engine for Max MSP and Ableton Live integration.',
                language: 'Python/Max',
                stars: '1.8K',
                license: 'MIT',
                link: 'https://github.com/inrecords/soundscape-gen'
              },
              {
                name: 'ethical-audio-datasets',
                description: 'Framework for building consensual, artist-compensated ML training datasets.',
                language: 'Python',
                stars: '890',
                license: 'Apache-2.0',
                link: 'https://github.com/inrecords/ethical-audio-datasets'
              },
              {
                name: 'stem-analysis-toolkit',
                description: 'Audio analysis and stem separation tools for educational and creative applications.',
                language: 'Python/PyTorch',
                stars: '3.1K',
                license: 'MIT',
                link: 'https://github.com/inrecords/stem-analysis-toolkit'
              },
            ].map((repo) => (
              <div key={repo.name} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-aurora/50 transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold">{repo.name}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">⭐</span>
                    <span>{repo.stars}</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{repo.description}</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-1 bg-aurora/20 text-aurora rounded-full text-xs">{repo.language}</span>
                  <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs">{repo.license}</span>
                </div>
                <Link href={repo.link} className="text-aurora hover:underline text-sm font-semibold">
                  View on GitHub →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborate */}
      <section className="p-12 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-playfair mb-6">Collaborate With Us</h2>
          <p className="text-xl text-gray-300 mb-8">
            We partner with universities, companies, and independent researchers pushing the boundaries
            of music technology. Let's build the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/research-partnership" className="px-10 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-bold text-lg">
              Partner With Us
            </Link>
            <Link href="/research-grants" className="px-10 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition font-bold text-lg">
              Apply for Grant
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/research-faq" className="hover:text-aurora transition">Research FAQ</Link>
            <span>•</span>
            <Link href="/publications" className="hover:text-aurora transition">All Publications</Link>
            <span>•</span>
            <Link href="/contact-research" className="hover:text-aurora transition">Contact Team</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
