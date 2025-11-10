import Link from 'next/link'

export default function Academy() {
  return (
    <section className="min-h-screen bg-white text-black p-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-playfair mb-4">inRECORD Academy</h2>
        <p className="text-lg max-w-2xl mb-8">
          Empowering artists through mentorship, production labs, and business literacy. Apply to develop your sound and brand
          with guidance from StudioNYNE and President Anderson.
        </p>
        <Link href="/apply" className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-900 transition">
          Apply Now
        </Link>

        {/* Curriculum Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { title: 'Songcraft & Production', description: 'Hands-on studio labs and arrangement clinics.' },
            { title: 'Brand & Release', description: 'Positioning, rollout strategy, and press assets.' },
            { title: 'Rights & Royalties', description: 'LexChronos-led literacy on splits and licensing.' },
          ].map((course) => (
            <div key={course.title} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
