import React from 'react'
import { useLocation, NavLink } from 'react-router-dom';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/ui/components/shared/shadcn-ui/navigation-menu"

type PathOption = "/vigitech-portal" | "radar-portal" | "/vigitech-portal/radar-portal" | "/vigitech-portal/radar" | "/vigitech-portal/faq" | "/vigitech-portal/about";

export const Header: React.FC = () => {
    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-700 via-blue-600 to-sky-500 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md py-3 px-4">
            <NavigationMenu viewport={false}>
                {(currentPath === "/vigitech-portal" || currentPath === "/vigitech-portal/faq" || currentPath === "/vigitech-portal/about") ? (
                    <NavigationMenuList className="flex flex-wrap sm:flex-nowrap gap-x-3 sm:gap-x-5 items-center text-sm sm:text-base">
                        {/* HOME */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition duration-300 hover:bg-white hover:text-blue-600 shadow-blue-900 shadow-sm focus:text-blue-600 ${currentPath === "/vigitech-portal" ? "bg-white text-blue-600 ring-2 ring-white/20 shadow-md" : ""
                                    }`}
                            >
                                <NavLink to="/">HOME</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* SERVICES */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-medium sm:font-semibold px-4 py-2 rounded-md sm:rounded-lg shadow-md sm:shadow-xl hover:scale-105 hover:shadow-2xl transition duration-300 ring-2 ring-white/20 focus:text-white text-sm sm:text-base">
                                SERVICES
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="p-0">
                                <ul className="grid w-[280px] md:w-[400px] gap-3 p-3 md:p-4 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-50 rounded-xl shadow-lg text-blue-950 ring-1 ring-white/30 backdrop-blur-sm absolute top-14 md:-left-10 left-0 md:static">
                                    {/* Items */}
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <NavLink to="radar-portal">
                                                <figure className='flex justify-between items-center gap-x-5'>
                                                    <img src='/vigitech_home_radar.jpg' className='w-20 h-20' />
                                                    <figcaption>
                                                        <div className="font-semibold text-base sm:text-lg">Technology Radar</div>
                                                        <div className="text-sm text-gray-700">
                                                            Track and evaluate the caliber of global tech trends.
                                                        </div>
                                                    </figcaption>
                                                </figure>
                                            </NavLink>
                                        </NavigationMenuLink>
                                    </li>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <NavLink to="#">
                                                <figure className='flex justify-between items-center gap-x-5'>
                                                    <img src='/vigitech_home_browser.jpg' className='w-20 h-20' />
                                                    <figcaption>
                                                        <div className="font-semibold text-base sm:text-lg">Technology Browser</div>
                                                        <div className="text-sm text-gray-700">
                                                            Find insights about all kinds of technologies.
                                                        </div>
                                                    </figcaption>
                                                </figure>
                                            </NavLink>
                                        </NavigationMenuLink>
                                    </li>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <NavLink to="#">
                                                <figure className='flex justify-between items-center gap-x-5'>
                                                    <img src='/vigitech_home_graphics.jpg' className='w-20 h-20' />
                                                    <figcaption>
                                                        <div className="font-semibold text-base sm:text-lg">Technology Graphics</div>
                                                        <div className="text-sm text-gray-700">
                                                            Analyze global tech trends and their impact through data visualizations.
                                                        </div>
                                                    </figcaption>
                                                </figure>
                                            </NavLink>
                                        </NavigationMenuLink>
                                    </li>
                                    <div className="w-full h-1 bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 rounded-full"></div>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* FAQ + ABOUT */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition duration-300 hover:bg-white hover:text-blue-600 shadow-blue-900 shadow-sm focus:text-blue-600 ${currentPath === "/vigitech-portal/faq" ? "bg-white text-blue-600 ring-2 ring-white/20 shadow-md" : ""
                                    }`}
                            >
                                <NavLink to="faq">FAQ</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition duration-300 hover:bg-white hover:text-blue-600 shadow-blue-900 shadow-sm focus:text-blue-600 ${currentPath === "/vigitech-portal/about" ? "bg-white text-blue-600 ring-2 ring-white/20 shadow-md" : ""
                                    }`}
                            >
                                <NavLink to="about">ABOUT</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                ) : (
                    <NavigationMenuList className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 sm:gap-x-6 text-sm sm:text-base">
                        {/* Secondary layout */}
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className="bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 text-white font-medium sm:font-semibold px-4 py-2 rounded-md sm:rounded-lg shadow-md sm:shadow-xl hover:scale-105 hover:shadow-2xl transition duration-300 ring-2 ring-white/20 focus:text-white"
                            >
                                <NavLink to="/vigitech-portal">Vigitech</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition duration-300 hover:bg-white hover:text-blue-600 shadow-blue-900 shadow-sm focus:text-blue-600 ${currentPath === "/vigitech-portal/radar-portal" ? "bg-white text-blue-600 ring-2 ring-white/20 shadow-md" : ""
                                    }`}
                            >
                                <NavLink to="radar-portal">Home</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                asChild
                                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition duration-300 hover:bg-white hover:text-blue-600 shadow-blue-900 shadow-sm focus:text-blue-600 ${currentPath === "/vigitech-portal/radar" ? "bg-white text-blue-600 ring-2 ring-white/20 shadow-md" : ""
                                    }`}
                            >
                                <NavLink to="radar">Radar</NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                )}
            </NavigationMenu>
        </header >
    )
}