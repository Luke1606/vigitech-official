import { useEffect } from "react";

export const About: React.FC = () => {

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])

    return (
        <main className="min-h-screen bg-blue-600 text-white">
            {/* Hero Section */}
            <section className="h-screen w-full bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-700 text-white px-4 sm:px-6 text-center relative overflow-hidden flex items-center justify-center">
                <img
                    src="/vigitech_home_welcome.jpg"
                    alt="Vigitech Vision"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                />
                <div className="relative z-10 max-w-4xl mx-auto" data-aos="fade-up" data-aos-duration="1500">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        About Vigitech
                    </h1>
                    <p className="text-lg md:text-xl text-white/80">
                        We’re shaping a smarter future by turning data into insight and innovation into impact.
                    </p>
                    <button
                        onClick={() =>
                            document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="mt-20 bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:shadow-violet-950 hover:shadow-xl transition duration-300 ring-2 ring-white/20">
                        Learn about us
                    </button>
                </div>
            </section>

            {/* Content Section */}
            <section id="about" className="bg-white text-gray-800 px-4 sm:px-6 py-20 relative overflow-hidden">
                {/* Decorative background */}
                <img src="/assets/bg-network.png" alt="" className="absolute top-[10%] left-[5%] w-64 sm:w-96 opacity-10 pointer-events-none z-0" />
                <img src="/assets/bg-grid.png" alt="" className="absolute bottom-[20%] right-[10%] w-56 sm:w-72 opacity-10 pointer-events-none z-0" />
                <img src="/assets/bg-circuits.png" alt="" className="absolute top-[50%] left-[40%] w-52 sm:w-60 rotate-3 opacity-10 pointer-events-none z-0" />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-10" data-aos="fade-down">Who We Are</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-16" data-aos="fade-up" data-aos-duration="1000">
                        At Vigitech, we believe technology is more than innovation—it’s transformation. Founded with a mission to
                        empower decision-makers through curated digital intelligence, our platform is designed to make sense of a
                        rapidly evolving tech landscape. Through dynamic visualizations, strategic analysis, and radar mapping, we
                        illuminate trends and reveal opportunities hidden in complexity.
                    </p>

                    <div className="grid md:grid-cols-3 gap-10 text-center" data-aos="zoom-in" data-aos-duration="1000">
                        {/* Pillars */}
                        {[
                            { title: "Clarity", icon: "/vigitech_about_clarity.jpg", desc: "Simplifying complexity in tech data so you focus on what matters." },
                            { title: "Insight", icon: "/vigitech_about_insight.jpg", desc: "Combining global data and expert filters to uncover strategic patterns." },
                            { title: "Impact", icon: "/vigitech_about_impact.jpg", desc: "Turning analysis into action, enabling smarter decisions across industries." },
                        ].map(({ title, icon, desc }, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <img src={icon} alt={title} className="w-16 h-16 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                                <p className="text-gray-600 text-base max-w-xs">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};