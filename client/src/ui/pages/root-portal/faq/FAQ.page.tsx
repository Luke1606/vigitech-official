import { useEffect } from "react";

export const FAQ: React.FC = () => {

    useEffect(() => {

        window.scrollTo({ top: 0 });
    }, [])

    return (
        <>
            {/* Decoración opaca tipo Vigitech */}
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-16 top-[160px] left-[40px] rotate-[30deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-20 top-[320px] left-[120px] rotate-[325deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-14 top-[480px] left-[40px] rotate-[10deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-16 top-[640px] left-[120px] rotate-[300deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-14 top-[160px] right-[40px] rotate-[30deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-16 top-[320px] right-[120px] rotate-[325deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-20 top-[480px] right-[40px] rotate-[10deg]" />
            <img src="/pregunta_faq.png" className="opacity-10 absolute w-14 top-[640px] right-[120px] rotate-[300deg]" />

            <section className="min-h-screen px-6 py-16 bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-700 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center gap-y-10">
                    {/* Títulos centrales */}
                    <section className="text-center">
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight">
                            Need Help? FAQ Center
                        </h1>
                        <p className="text-lg sm:text-xl text-white/80 mb-8">
                            Let’s clear up your doubts in a blink.
                        </p>
                        <p className="uppercase text-xl sm:text-2xl font-semibold text-cyan-300">
                            Select an option below to continue
                        </p>
                    </section>

                    {/* Bloques interactivos */}
                    <section
                        data-aos="zoom-in"
                        data-aos-duration="1500"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-10">
                        {[
                            { icon: "/radar_faq.png", label: "Radar", gradient: "from-fuchsia-400 via-violet-500 to-cyan-400" },
                            { icon: "/notificacion_faq.png", label: "Notifications", gradient: "from-indigo-500 via-purple-600 to-sky-400" },
                            { icon: "/configuration_faq.png", label: "Settings", gradient: "from-purple-500 via-fuchsia-500 to-cyan-400" },
                            { icon: "/heart_faq.png", label: "Give us a compliment", gradient: "from-cyan-400 via-blue-500 to-indigo-600" }
                        ].map(({ icon, label, gradient }, index) => (
                            <div
                                key={index}
                                className={`rounded-xl bg-white/5 backdrop-blur-md ring-1 ring-white/20 shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300`}
                            >
                                <div className={`bg-gradient-to-br ${gradient} w-20 h-20 rounded-full flex justify-center items-center mb-4 shadow-xl`}>
                                    <img src={icon} alt={label} className="w-10 h-10" />
                                </div>
                                <span className="text-lg font-medium text-white text-center">{label}</span>
                            </div>
                        ))}
                    </section>
                </div>
            </section>
        </>
    );
};