import { useEffect, useState, useRef } from 'react';
import radar_visualization from '@/assets/radar/radar_visualization';
import data from '@/assets/data/data';
import type { RadarEntry } from '@/infrastructure';

export const Radar: React.FC = () => {
    // const { resultsFilter, resultsOrder } = useContext(VisualDetailsContext)
    const [results, setResults] = useState<RadarEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const svgRef = useRef<SVGSVGElement | null>(null); // Tipar correctamente el ref

    // Cargar datos y establecer el estado de carga
    useEffect(() => {
        if (data) {
            setResults(data);
            setLoading(false);
        }
    }, []);

    // Ejecutar radar_visualization solo cuando loading es false y el SVG está disponible
    useEffect(() => {
        if (!loading && svgRef.current) {
            const config = {
                svg_id: "radar",
                width: 1920,
                height: 1080,
                colors: {
                    background: '#eee',
                    grid: "#bbb",
                    inactive: "#ddd"
                },
                quadrants: [
                    { name: "Languages and Framework" },
                    { name: "Scientific Stage" },
                    { name: "Business Intelligence" },
                    { name: "Platform and Supported Tool" },
                ],
                rings: [
                    { name: "ADOPT", color: "#5ba300" },
                    { name: "TEST", color: "#009eb0" },
                    { name: "EVALUATE", color: "#c7ba00" },
                    { name: "SUSTAIN", color: "#e09b96" }
                ],
                print_layout: true,
                links_in_new_tabs: true,
                entries: results
            };
            radar_visualization(config);
        }
    }, [loading, results]); // Solo depende de loading y results

    return (
        <>
            <section className='relative w-full scale-[0.65] h-[25vh]'>
                {loading ? <span>Loading...</span> : <svg id="radar" ref={svgRef} />}
            </section>
        </>
    );
};

// my DeepSeek API key *OJO CON FACHARTELA*

// function to get information from DeepSeek (***UNIMPLENTED YET, DONT TOUCH***)
// const deepseekSearch = async (term, dsApiKey) => {
//     const url = "https://api.deepseek.com/chat/completions"
//     const headers = {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${dsApiKey}`
//     };
//     const data = {
//         model: "deepseek-chat",
//         messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             { role: "user", content: term }
//         ],
//         stream: false
//     };

//     try {
//         const response = await axios.post(url, data, { headers });
//         return response.data;
//     } catch (error) {
//         console.error("Error al hacer la petición: ", error);
//         return null;
//     }
// }

/*
// function to search the technology in outters APIs
    const handleSearch = async () => {
        if (searchTerm !== '') {
            try {
                // search in OpenAlex
                const responseOpenAlex = await fetch(`https://api.openalex.org/works?filter=title.search:${searchTerm}`)
                const dataOpenAlex = await responseOpenAlex.json()
                console.log(dataOpenAlex)

                // search in DeepSeek
                const dsApiKey = "sk-59dc0909b3904b919e9ffb1f1cf4266a"
                deepseekSearch(searchTerm, dsApiKey).then(resultado => {
                    if (resultado) {
                        console.log(resultado)
                    }
                    else {
                        console.log("No hay resultados")
                    }
                })
                // get entries from self API
                const entries = await axios.get("http://localhost:8000/app/entries")

                // creating the new entrie
                const newEntrie = {
                    "label": `${searchTerm}`,
                    "quadrant": 1,
                    "ring": 1,
                    "active": true,
                    "moved": 0,
                    "link": `https://www.${searchTerm}.com`
                }

                // if there are entries
                if (entries.data.length != 0) {
                    entries.data.map( async (entry, index) => {
                        // if there is an entrie with the same label then update the entrie with the same label
                        if (entry.label === searchTerm) {
                            await axios.put(`http://localhost:8000/app/entries/${index + 1}/`, newEntrie)
                            setResults([])
                            return
                        }
                    })
                    }
                    // else post the new entrie
                    await axios.post("http://localhost:8000/app/entries/", newEntrie)
                    console.log(entries.data)
                    console.log(newEntrie)
                    setResults([])
            } catch (err) {
                console.log(err)
            }
        }
        else {
            alert("Plis enter the technology to search!")
        }
    }
*/


// useEffect(() => {
//     // getEntries()
// }, [])
// //console.log(datosContext)

// function to get entries from self API
// const getEntries = async () => {
//     let entries = await axios.get("http://localhost:8000/app/entries")
//     for (let i = 0; i < entries.data.length; i++) {
//         console.log(entries.data[i])
//         // getting info from OpenAlex
//         const responseOpenAlex = await fetch(`https://api.openalex.org/works?filter=title.search:${entries.data[i].label}`)
//         const seekDataOpenAlex = await responseOpenAlex.json()

//         let updatedEntrie;
//         // conditions to decide entries rings using information quality
//         if (seekDataOpenAlex.results.length >= 1 && seekDataOpenAlex.results.length <= 10 && seekDataOpenAlex.meta.count > 1 && seekDataOpenAlex.meta.count <= 100)
//             updatedEntrie = {
//                 "label": entries.data[i].label,
//                 "quadrant": entries.data[i].quadrant,
//                 "ring": 3,
//                 "active": entries.data[i].active,
//                 "moved": entries.data[i].move,
//                 "link": entries.data[i].link
//             }
//         else if (seekDataOpenAlex.results.length >= 11 && seekDataOpenAlex.results.length <= 25 && seekDataOpenAlex.meta.count > 100 && seekDataOpenAlex.meta.count <= 1000)
//             updatedEntrie = {
//                 "label": entries.data[i].label,
//                 "quadrant": entries.data[i].quadrant,
//                 "ring": 2,
//                 "active": entries.data[i].active,
//                 "moved": entries.data[i].move,
//                 "link": entries.data[i].link
//             }
//         else if (seekDataOpenAlex.results.length >= 26 && seekDataOpenAlex.results.length <= 50 && seekDataOpenAlex.meta.count > 1000 && seekDataOpenAlex.meta.count <= 5000)
//             updatedEntrie = {
//                 "label": entries.data[i].label,
//                 "quadrant": entries.data[i].quadrant,
//                 "ring": 1,
//                 "active": entries.data[i].active,
//                 "moved": entries.data[i].move,
//                 "link": entries.data[i].link
//             }
//         else
//             updatedEntrie = {
//                 "label": entries.data[i].label,
//                 "quadrant": entries.data[i].quadrant,
//                 "ring": 0,
//                 "active": entries.data[i].active,
//                 "moved": entries.data[i].move,
//                 "link": entries.data[i].link
//             }
//         //updating entries rings if change
//         await axios.put(`http://localhost:8000/app/entries/${entries.data[i].id}/`, updatedEntrie)
//     }
//     //get entries from self API
//     entries = await axios.get("http://localhost:8000/app/entries")
//     //console.log(entries.data);
//     setData(entries.data)
// }


