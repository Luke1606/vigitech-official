import React, { useState, useRef, useEffect } from "react";

// --- TIPOS DE DATOS ---
interface AnalysisMetrics {
  identificacionAgendas: number;
  triangulacionFuentes: number;
  cargaCognitiva: number;
  manipulacionNarrativa: number;
  anomaliasTecnicas: number;
  amplificacionCoordinada: number;
}

interface AnalysisResult {
  fidelityScore: number;
  verdict: string;
  redFlags: string[];
  agendas: string[];
  recommendation: string;
  metrics: AnalysisMetrics;
  sourcesFound?: { title: string; url: string; content: string }[];
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  analysis?: AnalysisResult;
}

export const NewsAnalyzerDashboard: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastAnalysis = [...messages].reverse().find(m => m.analysis)?.analysis;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const fullNewsText = input;
    let searchQuery = fullNewsText.substring(0, 350);

    console.log("🚀 Iniciando proceso de análisis forense...");
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: fullNewsText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. BÚSQUEDA TAVILY
      setCurrentStatus("Triangulando fuentes...");
      const tavilyResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: import.meta.env.VITE_TAVILY_API_KEY,
          query: searchQuery,
          search_depth: "advanced",
          max_results: 5,
          include_raw_content: true 
        })
      });

      if (!tavilyResponse.ok) throw new Error(`Error Tavily: ${tavilyResponse.status}`);
      const searchData = await tavilyResponse.json();
      
      const contextForAI = searchData.results.map((r: any) => 
        `FUENTE: ${r.title}\nURL: ${r.url}\nCONTENIDO: ${r.raw_content || r.content}\n---`
      ).join("\n");

      // 2. ANÁLISIS OSINT (OpenRouter)
      setCurrentStatus("Ejecutando razonamiento forense...");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "VigiTech Monitor"
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { 
              role: "system", 
              content: `Actúa como un Analista de Inteligencia Forense y Detector de Guerra Mediática. 
              Analiza la noticia basándote en el contexto. Detecta operaciones de influencia y sesgos.
              Responde ESTRICTAMENTE con un JSON válido (en fidelityScore, usa un número entre 0 y 100 basado en el pesaje y resultado de las otras métricas). No incluyas texto explicativo fuera del JSON.` 
            },
            { 
              role: "user", 
              content: `Analiza esta NOTICIA con este CONTEXTO:\n\nNOTICIA:\n${fullNewsText}\n\nCONTEXTO:\n${contextForAI}\n\nResponde en este formato JSON:\n{ "fidelityScore": 0-100, "verdict": "", "redFlags": [], "agendas": [], "recommendation": "", "metrics": { "identificacionAgendas": 0.1, "triangulacionFuentes": 0.1, "cargaCognitiva": 0.1, "manipulacionNarrativa": 0.1, "anomaliasTecnicas": 0.1, "amplificacionCoordinada": 0.1 } }` 
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error API: ${response.status} - ${errorData.error?.message || 'Unauthorized'}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      // Limpieza y Normalización del JSON
      const cleanJson = rawContent.replace(/```json|```/gi, "").trim();
      const parsedData = JSON.parse(cleanJson);

      // Blindaje de datos: Aseguramos que todas las propiedades existan
      const normalizedAnalysis: AnalysisResult = {
        fidelityScore: parsedData.fidelityScore ?? 50,
        verdict: parsedData.verdict ?? "Análisis parcial",
        redFlags: Array.isArray(parsedData.redFlags) ? parsedData.redFlags : [],
        agendas: Array.isArray(parsedData.agendas) ? parsedData.agendas : [],
        recommendation: parsedData.recommendation ?? "Se recomienda discreción.",
        metrics: {
          identificacionAgendas: parsedData.metrics?.identificacionAgendas ?? 0,
          triangulacionFuentes: parsedData.metrics?.triangulacionFuentes ?? 0,
          cargaCognitiva: parsedData.metrics?.cargaCognitiva ?? 0,
          manipulacionNarrativa: parsedData.metrics?.manipulacionNarrativa ?? 0,
          anomaliasTecnicas: parsedData.metrics?.anomaliasTecnicas ?? 0,
          amplificacionCoordinada: parsedData.metrics?.amplificacionCoordinada ?? 0,
        },
        sourcesFound: searchData.results.map((r: any) => ({
          title: r.title, url: r.url, content: r.content
        }))
      };

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: "Análisis completado.",
        analysis: normalizedAnalysis
      }]);

    } catch (error: any) {
      console.error("❌ ERROR:", error.message);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: `Error técnico: ${error.message}. Verifica tu API Key y saldo en OpenRouter.`
      }]);
    } finally {
      setIsLoading(false);
      setCurrentStatus("");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto h-full">
          {!lastAnalysis && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-slate-100 text-center">
                 <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
                 <h2 className="text-slate-900 text-xl font-black uppercase tracking-widest mb-2">VigiTech Monitor</h2>
                 <p className="text-sm italic opacity-70">Triangulación forense de desinformación en tiempo real.</p>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 flex flex-col items-center justify-center gap-6 shadow-sm">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{currentStatus}</span>
                </div>
              ) : (
                lastAnalysis && <DashboardCard result={lastAnalysis} />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pegue el cuerpo de la noticia para iniciar el análisis forense..."
            className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 pr-36 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[80px] max-h-[200px] resize-none shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-2xl px-8 py-3 text-[11px] font-black hover:bg-blue-700 disabled:opacity-20 transition-all uppercase tracking-wider shadow-lg shadow-blue-200"
          >
            Analizar
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const isDanger = result.fidelityScore < 40;
  const isWarning = result.fidelityScore >= 40 && result.fidelityScore < 70;
  const scoreColor = isDanger ? "text-red-600" : isWarning ? "text-amber-500" : "text-emerald-500";
  const bgScore = isDanger ? "bg-red-50/50" : isWarning ? "bg-amber-50/50" : "bg-emerald-50/50";

  return (
    <div className={`rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar de Métricas */}
        <div className={`lg:w-85 ${bgScore} p-10 border-r border-slate-100`}>
          <header className="mb-10 text-center lg:text-left">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Índice de Veracidad</h3>
            <div className={`text-7xl font-black tracking-tighter ${scoreColor}`}>
              {result.fidelityScore}
              <span className="text-2xl opacity-20 ml-1">/100</span>
            </div>
            <p className={`text-xs font-black mt-3 uppercase tracking-widest ${scoreColor} bg-white inline-block px-4 py-1 rounded-full shadow-sm`}>
              {result.verdict}
            </p>
          </header>

          <div className="space-y-7">
            {Object.entries(result.metrics || {}).map(([key, val], i) => (
              <div key={i}>
                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase mb-2 tracking-wider">
                  <span className="truncate mr-4">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={scoreColor}>{(Number(val) * 10).toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${val > 0.7 ? 'bg-red-500' : val > 0.4 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                    style={{ width: `${Math.min(Number(val) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> 
                Banderas de Alerta
              </h4>
              <ul className="space-y-4">
                {result.redFlags.map((f, i) => (
                  <li key={i} className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border-l-4 border-red-500 shadow-sm font-medium">
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <div className="space-y-10">
              <section>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Estrategia Sugerida</h4>
                <div className="bg-slate-900 text-blue-100 p-6 rounded-4xl text-[12px] leading-relaxed italic shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V5C13.017 3.89543 13.9124 3 15.017 3H21.017C22.1216 3 23.017 3.89543 23.017 5V12C23.017 13.1046 22.1216 14 21.017 14H20.017V16H21.017C22.1216 16 23.017 16.8954 23.017 18V21H14.017ZM1 21L1 18C1 16.8954 1.89543 16 3 16H6V14H2C0.89543 14 0 13.1046 0 12V5C0 3.89543 0.89543 3 2 3H8C9.10457 3 10 3.89543 10 5V12C10 13.1046 9.10457 14 8 14H7V16H8C9.10457 16 10 16.8954 10 18V21H1ZM3 5V12H8V5H3Z" /></svg>
                  </div>
                  "{result.recommendation}"
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Fuentes de Contraste</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sourcesFound?.slice(0, 5).map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all truncate max-w-[180px] shadow-sm">
                      {s.title}
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};