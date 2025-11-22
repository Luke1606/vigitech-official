import { useEffect } from "react";
import { PathOption } from "../../../../infrastructure";
import { NavLink } from "react-router-dom";

export const TechnologyRadarHome: React.FC = () => {

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])

    return (
        <main className="min-h-screen min-w-screen text-white">
            {/* Hero Section - Technology Radar */}
            <section className="min-h-screen w-full bg-linear-to-br from-indigo-800 via-purple-700 to-blue-700 px-4 sm:px-6 text-center relative overflow-hidden flex items-center justify-center">
                <img
                    src="/vigitech_home_radar.jpg"
                    alt="Radar globe"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                />
                <div className="relative z-10 max-w-lg sm:max-w-4xl mx-auto px-2" data-aos="zoom-in" data-aos-duration="1500">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Navega el panorama de las tecnologías emergentes.
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8">
                        El Radar Tecnológico te brinda acceso dinámico a las tendencias globales en evolución.
                        Descubre innovaciones, evalúa su nivel de madurez y visualiza
                        cómo la tecnología está moldeando el futuro en todos los sectores.
                    </p>
                    <button
                        onClick={() =>
                            document.getElementById("info")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:shadow-violet-950 hover:shadow-xl transition duration-300 ring-2 ring-white/20">
                        ¡¡ Exploremos cómo funciona el Radar !!
                    </button>
                </div>
            </section>

            <section id="info" className="bg-white text-gray-800 px-4 sm:px-6 py-20 sm:py-20 relative overflow-hidden">
                {/* Decorative Background */}
                <img
                    src="/assets/bg-network.png"
                    alt=""
                    className="absolute top-[10%] left-[5%] w-64 sm:w-96 opacity-10 pointer-events-none z-0"
                />
                <img
                    src="/assets/bg-grid.png"
                    alt=""
                    className="absolute bottom-[20%] right-[10%] w-56 sm:w-72 opacity-10 pointer-events-none z-0"
                />
                <img
                    src="/assets/bg-circuits.png"
                    alt=""
                    className="absolute top-[50%] left-[40%] w-52 sm:w-60 rotate-3 opacity-10 pointer-events-none z-0"
                />

                {/* Radar Process Cards with Subtitles */}
                <div className="flex flex-wrap justify-center gap-x-28 gap-y-28">
                    {[
                        {
                            title: "Recopilación de Información",
                            imgSrc: "/radar_home_hub.jpg",
                            description:
                                "El radar comienza explorando diversas fuentes digitales en Internet, recopilando información clave sobre tecnologías emergentes.",
                            animation: "fade-left",
                        },
                        {
                            title: "Identificación de Tendencias",
                            imgSrc: "/radar_home_trends.jpg",
                            description:
                                "Luego, organiza la información recopilada, identifica patrones y destaca las tendencias tecnológicas más relevantes a nivel mundial.",
                            animation: "fade-down",
                        },
                        {
                            title: "Análisis Estratégico",
                            imgSrc: "/radar_home_analysis.jpg",
                            description:
                                "Finalmente, aplica filtros y procesos de análisis que determinan el posicionamiento estratégico de cada tecnología dentro del mapa de radar.",
                            animation: "fade-right",
                        },
                    ].map(({ title, imgSrc, description, animation }, index) => (
                        <div key={index} className="flex flex-col items-center max-w-[360px] justify-center" data-aos={animation} data-aos-duration="1000">
                            <h3 className="text-2xl font-semibold text-center mb-20">
                                <span className="inline-block bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white px-3 py-1 rounded-md mr-3 shadow-md">
                                    {index + 1}
                                </span>
                                {title}
                            </h3>

                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <img
                                            alt="Illustration"
                                            className="rounded-[1em] absolute w-full h-full top-0 mb-4"
                                            src={imgSrc}
                                        />
                                    </div>
                                    <div className="flip-card-back">
                                        <p className="text-[20px] font-semibold text-left m-0 max-w-[300px] relative top-0 left-[60px] leading-[50px]">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="text-black flex lg:justify-center lg:flex-row flex-col justify-center lg:gap-x-10 gap-y-5 py-10 lg:px-0 px-5 text-center">
                <NavLink to={PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED} className="bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
                    ¡¡ Veamos las recomendaciones !!
                </NavLink>
                <NavLink to={PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR} className="bg-linear-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 hover:shadow-violet-900 hover:shadow-xl transition duration-300">
                    ¡¡ Echemos un vistazo al Radar !!
                </NavLink>
            </section>
        </main>
    )
}