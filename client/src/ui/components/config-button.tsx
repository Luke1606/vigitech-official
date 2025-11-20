import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from ".";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from ".";
import { Label } from ".";
import { Switch } from ".";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ".";
import { AnalysisFrequency } from "../../infrastructure";

export function SettingsModal() {
    const [open, setOpen] = useState(false);

    // Estados para los campos de configuración
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState("oscuro");
    const [analysisFreq, setAnalysisFreq] = useState("10 minutos");
    const [autoSave, setAutoSave] = useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button size="icon" className="bg-blue-800 shadow-blue-950 shadow-sm border-none">
                    <Settings className={`
                        min-h-6 min-w-6 
                        transition-transform duration-300 ease-in-out
                        ${open ? 'rotate-90' : '-rotate-90'}
                    `} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configuración de la Aplicación</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    <div className="flex justify-around">
                        {/* Campo de tema */}
                        <div className="grid gap-2">
                            <Label htmlFor="theme">Frecuencia de análisis</Label>
                            <Select value={analysisFreq} onValueChange={setAnalysisFreq}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10 minutos">{AnalysisFrequency.EVERY_10_MINUTES}</SelectItem>
                                    <SelectItem value="30 minutos">{AnalysisFrequency.EVERY_30_MINUTES}</SelectItem>
                                    <SelectItem value="1 hora">{AnalysisFrequency.HOURLY}</SelectItem>
                                    <SelectItem value="6 horas">{AnalysisFrequency.EVERY_6_HOURS}</SelectItem>
                                    <SelectItem value="Diario">{AnalysisFrequency.DAILY}</SelectItem>
                                    <SelectItem value="2 días">{AnalysisFrequency.EVERY_TWO_DAYS}</SelectItem>
                                    <SelectItem value="4 días">{AnalysisFrequency.EVERY_FOUR_DAYS}</SelectItem>
                                    <SelectItem value="Semanal">{AnalysisFrequency.WEEKLY}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Campo de tema */}
                        <div className="grid gap-2">
                            <Label htmlFor="theme">Tema de la aplicación</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="claro">Claro</SelectItem>
                                    <SelectItem value="oscuro">Oscuro</SelectItem>
                                    <SelectItem value="auto">Automático</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Interruptores de configuración */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications" className="flex flex-col space-y-1">
                                <span>Notificaciones</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Recibir notificaciones del sistema
                                </span>
                            </Label>
                            <Switch
                                id="notifications"
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="autoSave" className="flex flex-col space-y-1">
                                <span>Guardado automático</span>
                                <span className="font-normal text-xs text-gray-500">
                                    Guardar cambios automáticamente
                                </span>
                            </Label>
                            <Switch
                                id="autoSave"
                                checked={autoSave}
                                onCheckedChange={setAutoSave}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}