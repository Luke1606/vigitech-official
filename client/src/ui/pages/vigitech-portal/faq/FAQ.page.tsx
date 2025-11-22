import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "../../../components";
import { Textarea } from "../../../components/shared/shadcn-ui/textarea";

export const FAQ: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const handleOpenForm = (label: string): void => {
        setSelectedOption(label);
        setOpen(true);
    };

    const handleSendMail = (): void => {
        if (!selectedOption) return;
        const subject = encodeURIComponent(selectedOption);
        const body = encodeURIComponent(message);
        window.location.href = `mailto:abel04.mata@ejemplo.com?subject=${subject}&body=${body}`;
        setOpen(false);
        setMessage("");
    };

    return (
        <>
            <section className="min-h-screen min-w-screen px-6 py-16 bg-linear-to-br from-indigo-800 via-purple-700 to-blue-700 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center gap-y-10">
                    {/* Títulos centrales */}
                    <section className="text-center">
                        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight">
                            Necesitas ayuda? Centro FAQ
                        </h1>
                        <p className="text-lg sm:text-xl text-white/80 mb-8">
                            Aclaremos tus dudas en un abrir y cerrar de ojos.
                        </p>
                        <p className="uppercase text-xl sm:text-2xl font-semibold text-cyan-300">
                            Selecciona una de las opciones debajo.
                        </p>
                    </section>

                    {/* Bloques interactivos */}
                    <section
                        data-aos="zoom-in"
                        data-aos-duration="1500"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-10"
                    >
                        {[
                            {
                                icon: "/radar_faq.png",
                                label: "Radar",
                                gradient: "from-fuchsia-400 via-violet-500 to-cyan-400",
                            },
                            {
                                icon: "/notificacion_faq.png",
                                label: "Notificaciones",
                                gradient: "from-indigo-500 via-purple-600 to-sky-400",
                            },
                            {
                                icon: "/configuration_faq.png",
                                label: "Configuraciones",
                                gradient: "from-purple-500 via-fuchsia-500 to-cyan-400",
                            },
                            {
                                icon: "/heart_faq.png",
                                label: "Danos un cumplido",
                                gradient: "from-cyan-400 via-blue-500 to-indigo-600",
                            },
                        ].map(({ icon, label, gradient }, index) => (
                            <div
                                key={index}
                                onClick={() => handleOpenForm(label)}
                                className="cursor-pointer rounded-xl bg-white/5 backdrop-blur-md ring-1 ring-white/20 shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-all duration-300"
                            >
                                <div
                                    className={`bg-linear-to-br ${gradient} w-20 h-20 rounded-full flex justify-center items-center mb-4 shadow-xl`}
                                >
                                    <img src={icon} alt={label} className="w-10 h-10" />
                                </div>
                                <span className="text-lg font-medium text-white text-center">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </section>
                </div>
            </section>

            {/* Formulario modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar mensaje sobre: {selectedOption}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                        <span className="text-foreground/70">Escribe tu mensaje en el espacio debajo</span>
                        <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setMessage(e.target.value)
                            }
                        />
                        <Button
                            onClick={handleSendMail}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Enviar correo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};