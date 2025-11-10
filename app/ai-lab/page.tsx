import Link from 'next/link'

export default function AILab() {
  return (
    <section
      className="min-h-screen text-white p-12"
      style={{
        background: `radial-gradient(1200px 600px at 20% 20%, rgba(0,153,255,0.25), transparent),
                     radial-gradient(1000px 600px at 80% 30%, rgba(255,0,149,0.22), transparent),
                     radial-gradient(800px 600px at 50% 80%, rgba(255,165,0,0.18), rgba(0,0,0,0.8))`
      }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-playfair mb-4">inRECORD AI Lab</h2>
        <p className="text-lg max-w-2xl mb-8">
          Exploring adaptive mastering and generative soundscapes. Machines that listen like producers.
        </p>
        <Link href="/research" className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition">
          Discover Research
        </Link>

        {/* Experiments */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { title: 'Adaptive Mastering', description: 'Real-time mastering tuned to genre and emotion.' },
            { title: 'Generative Soundscapes', description: 'Ambient systems for film, wellness, and games.' },
            { title: 'Dataset Curation', description: 'Ethical, artist-first datasets for model training.' },
          ].map((experiment) => (
            <div key={experiment.title} className="rounded-2xl p-6 border border-white/10 bg-white/5">
              <h3 className="font-semibold mb-2">{experiment.title}</h3>
              <p className="text-sm text-white/80">{experiment.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
