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
import { Input } from ".";
import { Switch } from ".";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ".";

export function SettingsModal() {
    const [open, setOpen] = useState(false);

    // Estados para los campos de configuración
    const [username, setUsername] = useState("");
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState("oscuro");
    const [language, setLanguage] = useState("español");
    const [fontSize, setFontSize] = useState(14);
    const [autoSave, setAutoSave] = useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="absolute top-18 bg-blue-500 text-white hover:bg-blue-700">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configuración de la Aplicación</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Campo de nombre de usuario */}
                    <div className="grid gap-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Ingresa tu nombre"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
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

                    {/* Campo de idioma */}
                    <div className="grid gap-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="español">Español</SelectItem>
                                <SelectItem value="inglés">Inglés</SelectItem>
                                <SelectItem value="francés">Francés</SelectItem>
                                <SelectItem value="alemán">Alemán</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Campo de tamaño de fuente */}
                    <div className="grid gap-2">
                        <Label htmlFor="fontSize">
                            Tamaño de fuente: {fontSize}px
                        </Label>
                        <Input
                            id="fontSize"
                            type="range"
                            min="10"
                            max="24"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>10px</span>
                            <span>24px</span>
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

                    {/* Información adicional */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Información de la aplicación</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>Versión: 1.0.0</p>
                            <p>Última actualización: 15 Nov 2024</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}