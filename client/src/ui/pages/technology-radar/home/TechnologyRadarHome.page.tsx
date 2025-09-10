import { useEffect } from "react";

export const TechnologyRadarHome: React.FC = () => {

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])

    return (
        <main className="min-h-screen text-white">
            {/* Hero Section - Technology Radar */}
            <section className="h-screen w-full bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-700 px-4 sm:px-6 text-center relative overflow-hidden flex items-center justify-center">
                <img
                    src="/vigitech_home_radar.jpg"
                    alt="Radar globe"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                />
                <div className="relative z-10 max-w-lg sm:max-w-4xl mx-auto px-2" data-aos="zoom-in" data-aos-duration="1500">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Navigate the Landscape of Emerging Technologies
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8">
                        The Technology Radar gives you dynamic access to evolving global trends. Discover innovations, assess maturity, and visualize how tech is shaping the future across industries.
                    </p>
                    <button
                        onClick={() =>
                            document.getElementById("info")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:shadow-violet-950 hover:shadow-xl transition duration-300 ring-2 ring-white/20">
                        Let’s explore how Radar works
                    </button>
                </div>
            </section>

            <section id="info" className="bg-white text-gray-800 px-4 sm:px-6 py-16 sm:py-20 relative overflow-hidden">
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
                            title: "Information Gathering",
                            imgSrc: "/radar_home_hub.jpg",
                            description:
                                "The radar begins by exploring various digital sources across the Internet, collecting key information about emerging technologies.",
                            animation: "fade-left",
                        },
                        {
                            title: "Trend Identification",
                            imgSrc: "/radar_home_trends.jpg",
                            description:
                                "Next, it organizes the gathered information, identifying patterns and highlighting the most relevant technological trends worldwide.",
                            animation: "fade-down",
                        },
                        {
                            title: "Strategic Analysis",
                            imgSrc: "/radar_home_analysis.jpg",
                            description:
                                "Finally, it applies filters and analysis processes that determine the strategic positioning of each technology within the radar map.",
                            animation: "fade-right",
                        },
                    ].map(({ title, imgSrc, description, animation }, index) => (
                        <div key={index} className="flex flex-col items-center max-w-[360px] justify-center" data-aos={animation} data-aos-duration="1000">
                            <h3 className="text-2xl font-semibold text-center mb-20">
                                <span className="inline-block bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white px-3 py-1 rounded-md mr-3 shadow-md">
                                    1
                                </span>
                                {title}
                            </h3>

                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <img
                                            alt="Illustration"
                                            className="rounded-[1em] absolute w-full h-full top-0 mb-[1rem]"
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
        </main>
    )
}