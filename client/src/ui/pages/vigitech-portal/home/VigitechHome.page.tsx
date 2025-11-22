
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react';
import { PathOption } from '../../../../infrastructure';

export const PortalHome: React.FC = () => {

  useEffect(() => {

    window.scrollTo({ top: 0 });
  }, [])

  return (
    <main className="min-h-screen bg-blue-600 text-white overflow-x-hidden">
      <section className="min-h-screen min-w-full bg-linear-to-br from-indigo-800 via-purple-700 to-blue-700 text-white text-center relative overflow-hidden flex items-center justify-center px-5 lg:px-0">
        < img
          src="/vigitech_home_welcome.jpg"
          alt="Futuristic world"
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
        />
        <div className="relative z-10 max-w-4xl mx-auto" data-aos="zoom-in" data-aos-duration="1500">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Bienvenido al futuro de la inteligencia tecnológica.
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            La plataforma Vigitech es tu puerta de entrada para explorar las innovaciones tecnológicas más transformadoras del mundo.
            Fusionamos visión, impacto e intuición, para que siempre estés un paso adelante en el panorama tecnológico global.
          </p>
          <button
            onClick={() =>
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:shadow-violet-950 hover:shadow-xl transition duration-300 ring-2 ring-white/20">
            ¡¡ Comienza a explorar !!
          </button>
        </div>
      </section >

      <section id="services" className="bg-white text-gray-800 px-6 py-20 relative">
        <h2 className="text-4xl font-bold text-center mb-16">Explora los servicios de Vigitech</h2>

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
            <h3 className="text-3xl font-semibold mb-4">Radar Tecnológico</h3>
            <p className="text-lg text-gray-700 mb-6">
              Descubre tecnologías emergentes y sigue su evolución, relevancia e impacto global.
              Nuestro radar ofrece una visualización dinámica de innovaciones en diversos sectores,
              ayudándote a mantenerte a la vanguardia en estrategia y adopción.
            </p>
            <NavLink to={PathOption.TECHNOLOGY_RADAR_PORTAL} className="bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
              Accede al Radar
            </NavLink>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-24 items-center md:flex-row-reverse ">
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
            <h3 className="text-3xl font-semibold mb-4">Buscador de Tecnologías</h3>
            <p className="text-lg text-gray-700 mb-6">
              Explora un extenso índice de tecnologías, desde innovaciones disruptivas hasta sistemas heredados.
              Filtra por sector, región, nivel de madurez y más.
              Ya sea que estés investigando o realizando análisis comparativos,
              nuestro navegador te ofrece datos seleccionados al alcance de tu mano.
            </p>
            <button className="bg-linear-to-br from-indigo-500 via-purple-600 to-sky-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xxl transition duration-300">
              Busca Tecnologías
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
            <h3 className="text-3xl font-semibold mb-4">Gráficos Tecnológicos</h3>
            <p className="text-lg text-gray-700 mb-6">
              Visualiza las tendencias tecnológicas globales,
              las tasas de adopción y el impacto tecnológico mediante gráficos y paneles interactivos.
              Nuestro motor de visualización transforma datos en bruto en ideas claras,
              para que puedas tomar decisiones informadas en cada etapa.
            </p>
            <button className="bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
              Explora visualizaciones
            </button>
          </div>
        </div>
      </section>
    </main >
  )
}