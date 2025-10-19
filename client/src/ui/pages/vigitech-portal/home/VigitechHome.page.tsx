
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react';
import { PathOption } from '@/infrastructure';

export const PortalHome: React.FC = () => {

  useEffect(() => {

    window.scrollTo({ top: 0 });
  }, [])

  return (
    <main className="min-h-screen bg-blue-600 text-white overflow-x-hidden">
      <section className="h-screen w-full bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-700 text-white px-6 text-center relative overflow-hidden flex items-center justify-center">
        <img
          src="/vigitech_home_welcome.jpg"
          alt="Futuristic world"
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
        />
        <div className="relative z-10 max-w-4xl mx-auto" data-aos="zoom-in" data-aos-duration="1500">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Welcome to the Future of Tech Intelligence
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Vigitech Portal is your gateway to exploring the most transformative technological innovations worldwide.
            We merge insight, impact, and intuition—so you're always one step ahead in the global tech landscape.
          </p>
          <button
            onClick={() =>
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:shadow-violet-950 hover:shadow-xl transition duration-300 ring-2 ring-white/20">
            Begin Your Exploration
          </button>
        </div>
      </section>

      <section id="services" className="bg-white text-gray-800 px-6 py-20 relative">
        <h2 className="text-4xl font-bold text-center mb-16">Explore Vigitech’s Services</h2>

        <div className="grid md:grid-cols-2 gap-12 mb-24 items-center">
          <img
            src="/vigitech_home_radar.jpg"
            alt="Technology Radar"
            className="w-full rounded-xl shadow-lg"
            data-aos="fade-right"
            data-aos-duration="1500"
          />
          <div
            data-aos="fade-left"
            data-aos-duration="1500"
          >
            <h3 className="text-3xl font-semibold mb-4">Technology Radar</h3>
            <p className="text-lg text-gray-700 mb-6">
              Discover emerging technologies and track their maturity, relevance, and global impact.
              Our radar provides dynamic visualization of innovations across sectors, helping you stay
              ahead in strategy and adoption.
            </p>
            <NavLink to={PathOption.TECHNOLOGY_RADAR_PORTAL} className="bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
              Access Radar
            </NavLink>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-24 items-center md:flex-row-reverse">
          <img
            src="/vigitech_home_browser.jpg"
            alt="Technology Browser"
            className="w-full rounded-xl shadow-lg"
            data-aos="fade-right"
            data-aos-duration="1500"

          />
          <div
            data-aos="fade-left"
            data-aos-duration="1500"
          >
            <h3 className="text-3xl font-semibold mb-4">Technology Browser</h3>
            <p className="text-lg text-gray-700 mb-6">
              Search through an extensive index of technologies—from disruptive innovations to legacy systems.
              Filter by sector, region, maturity level and more. Whether you're researching or benchmarking,
              our browser gives you curated data at your fingertips.
            </p>
            <button className="bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xxl transition duration-300">
              Browse Technologies
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/vigitech_home_graphics.jpg"
            alt="Technology Graphics"
            className="w-full rounded-xl shadow-lg"
            data-aos="fade-right"
            data-aos-duration="1500"
          />
          <div
            data-aos="fade-left"
            data-aos-duration="1500"
          >
            <h3 className="text-3xl font-semibold mb-4">Technology Graphics</h3>
            <p className="text-lg text-gray-700 mb-6">
              Visualize global tech trends, adoption rates, and technological impact using interactive charts and dashboards.
              Our visualization engine transforms raw data into clear insights so you can make informed decisions at every stage.
            </p>
            <button className="bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
              Explore Visualizations
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}