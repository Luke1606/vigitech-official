import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/ui/components/shared/shadcn-ui/dropdown-menu";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/ui/components/shared/shadcn-ui/tooltip"

const oficiales: string[] = [
    "Oficial 1",
    "Oficial 2",
    "Oficial 3",
    "Oficial 4",
    "Oficial 5",
    "Oficial 6",
    "Oficial 7",
    "Oficial 8",
    "Oficial 9",
    "Oficial 10",
]

const candidatos: string[] = [
    "Candidato 1",
    "Candidato 2",
    "Candidato 3",
    "Candidato 4",
    "Candidato 5",
    "Candidato 6",
    "Candidato 7",
    "Candidato 8",
    "Candidato 9",
    "Candidato 10",
]

const ignorados: string[] = [
    "Ignorado 1",
    "Ignorado 2",
    "Ignorado 3",
    "Ignorado 4",
    "Ignorado 5",
    "Ignorado 6",
    "Ignorado 7",
    "Ignorado 8",
    "Ignorado 9",
    "Ignorado 10",
]

export const SideBar: React.FC = () => {
    return (
        <aside className="fixed top-12 left-0 z-40 md:h-[calc(100vh-3rem)] md:w-64 bg-gray-100 md:border-r p-4 
                         w-full h-auto border-r-0 border-b">
            <ul className="space-y-2 flex space-x-4 md:flex-col md:items-start justify-between">
                <li>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full text-left hover:text-blue-600 sm:text-center font-bold">Oficiales<span className="ml-2 md:ml-4">✅</span></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-lg">Oficiales<span className="ml-4">✅</span></DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {oficiales.map((oficial, index) => (
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex gap-x-1 justify-between items-center">
                                        <DropdownMenuItem key={index} className="text-md">
                                            {oficial}

                                        </DropdownMenuItem>
                                        <div className="flex gap-x-2 items-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="bg-blue-500 rounded-full text-sm">❔</span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Candidatos<span className="bg-blue-500 rounded-full text-sm ml-2">❔</span></p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    🚫
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Ignorados 🚫</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
                <li>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full text-left hover:text-blue-600 sm:text-center font-bold">Candidatos<span className="bg-blue-500 rounded-full text-sm ml-2 md:ml-4">❔</span></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-lg">
                                Candidatos
                                <span className="bg-blue-500 rounded-full scale-90 ml-4">❔</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {candidatos.map((candidato, index) => (
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex gap-x-1 justify-between items-center">
                                        <DropdownMenuItem key={index} className="text-md">
                                            {candidato}

                                        </DropdownMenuItem>
                                        <div className="flex gap-x-2 items-center">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    ✅
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Oficiales ✅</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    🚫
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Ignorados 🚫</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
                <li>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full text-left hover:text-blue-600 sm:text-center font-bold">Ignorados<span className="ml-2 md:ml-4">🚫</span></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel className="text-lg">Ignorados<span className="ml-4">🚫</span></DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ignorados.map((ignorado, index) => (
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex gap-x-1 justify-between items-center">
                                        <DropdownMenuItem key={index} className="text-md">
                                            {ignorado}

                                        </DropdownMenuItem>
                                        <div className="flex gap-x-2 items-center">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    ✅
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Oficiales ✅</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <span className="bg-blue-500 rounded-full text-sm">❔</span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mover a Candidatos<span className="bg-blue-500 rounded-full text-sm ml-2">❔</span></p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
            </ul>
        </aside >
    )
};