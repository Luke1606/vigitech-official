import { useEffect } from "react";
import { NavLink } from "react-router-dom";
// Nota: Ajusta las rutas según tu infrastructure/PathOption
import { PathOption } from "../../../../infrastructure";

export const NewsAnalyzerHome: React.FC = () => {
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return (
        <main className="min-h-screen min-w-screen text-slate-100">
            {/* Hero Section */}
            <section className="min-h-screen w-full bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 px-4 sm:px-6 text-center relative overflow-hidden flex items-center justify-center">
                {/* Decorative background grid/pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
                
                <div className="relative z-10 max-w-lg sm:max-w-4xl mx-auto px-2" data-aos="fade-up" data-aos-duration="1200">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-6 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Monitor de Guerra Mediática y Cognitiva
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-100 to-blue-400">
                        Verifica el ecosistema informativo en tiempo real.
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Una plataforma integrada impulsada por IA para evaluar la veracidad, 
                        desarmar narrativas manipuladas y detectar campañas coordinadas de desinformación.
                    </p>
                    <button
                        onClick={() => document.getElementById("methodology")?.scrollIntoView({ behavior: "smooth" })}
                        className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 transition-all duration-300 ring-1 ring-white/10"
                    >
                        Conoce la Metodología
                    </button>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="bg-slate-50 text-slate-800 px-4 sm:px-6 py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Análisis Sistémico en 3 Fases</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Nuestro motor aplica ingeniería de atribución, análisis cognitivo y triangulación de fuentes para brindarte un veredicto claro.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                step: "01",
                                title: "Ingesta y Extracción",
                                desc: "Ingresa URLs, textos o imágenes. El sistema extrae metadatos, identifica afirmaciones clave y mapea el contexto inicial de la noticia.",
                                icon: "🌐"
                            },
                            {
                                step: "02",
                                title: "Triangulación e IA",
                                desc: "Cruzamos datos con fuentes oficiales, analizamos la carga emocional del lenguaje y buscamos patrones de amplificación artificial o deepfakes.",
                                icon: "🧠"
                            },
                            {
                                step: "03",
                                title: "Veredicto Estratégico",
                                desc: "Generamos un Índice de Confiabilidad, detectamos agendas ocultas y te proponemos contranarrativas fundamentadas para el prebunking.",
                                icon: "🛡️"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                                <div className="text-4xl mb-6">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.step}</span>
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-slate-900 border-t border-slate-800 py-20 text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">¿Listo para analizar el ecosistema?</h2>
                <div className="flex justify-center">
                    <NavLink 
                        to={PathOption.NEWS_ANALYZER_DASHBOARD} 
                        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-blue-900/50 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                    >
                        <span>Abrir Dashboard Analítico</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </NavLink>
                </div>
            </section>
        </main>
    );
}