import React, { useEffect, useState } from 'react'
import { useLocation, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "../../shared/shadcn-ui/navigation-menu"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "../../shared/shadcn-ui/sheet"
import { Button } from "../../shared/shadcn-ui/button"
import { PathOption } from '../../../../infrastructure';
import { NotificationCenter } from '../../notification-center';
import styles from './Header.styles';
import { ServiceCard, type ServiceCardProps } from './service-card';
import { SettingsModal } from '../../config-button';
import { Menu } from 'lucide-react';

export const Header: React.FC = () => {
    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;
    const [isMobile, setIsMobile] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const separator = <div className={styles.separator}></div>
    const servicesInfo: {
        to: PathOption,
        service: ServiceCardProps
    }[] = [
            {
                to: PathOption.TECHNOLOGY_RADAR_PORTAL,
                service: {
                    imageSrc: '/vigitech_home_radar.jpg',
                    title: 'Radar Tecnológico',
                    alt: 'Radar Service Home',
                    description: 'Supervisa y evalúa la calidad de las tendencias tecnológicas globales.'
                }
            },
            {
                to: '#' as PathOption,
                service: {
                    imageSrc: '/vigitech_home_browser.jpg',
                    title: 'Buscador de Tecnologías',
                    alt: 'Browser Service Home',
                    description: 'Encuentra información clave sobre todo tipo de tecnologías.'
                }
            },
            {
                to: '#' as PathOption,
                service: {
                    imageSrc: '/vigitech_home_graphics.jpg',
                    title: 'Gráficos Tecnológicos',
                    alt: 'Graphics Service Home',
                    description: 'Analiza las tendencias tecnológicas globales y su impacto mediante visualizaciones de datos.'
                }
            },
        ];

    const isVigitechView = (
        currentPath === PathOption.VIGITECH_PORTAL_HOME ||
        currentPath === PathOption.VIGITECH_PORTAL_FAQ ||
        currentPath === PathOption.VIGITECH_PORTAL_ABOUT ||
        currentPath === PathOption.VIGITECH_PORTAL_CTA
    );

    // Función para determinar si una ruta está activa (usando comparación exacta)
    const isActivePath = (path: PathOption) => currentPath === path;

    const MobileMenuContent = () => (
        <div className="flex flex-col gap-4 mt-6">
            {isVigitechView ? (
                <>
                    <NavLink
                        to={PathOption.VIGITECH_PORTAL_HOME}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.VIGITECH_PORTAL_HOME)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        Inicio
                    </NavLink>

                    <div className="px-4 py-2 font-semibold text-white border-b border-white/30">
                        SERVICIOS
                    </div>

                    {servicesInfo.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={`px-6 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(item.to)
                                ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                                : 'text-white'
                                }`}
                            onClick={() => setSheetOpen(false)}
                        >
                            {item.service.title}
                        </NavLink>
                    ))}

                    <NavLink
                        to={PathOption.VIGITECH_PORTAL_FAQ}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.VIGITECH_PORTAL_FAQ)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        FAQ
                    </NavLink>

                    <NavLink
                        to={PathOption.VIGITECH_PORTAL_ABOUT}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.VIGITECH_PORTAL_ABOUT)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        ACERCA DE
                    </NavLink>
                </>
            ) : (
                <>
                    {/* Home del Radar */}
                    <NavLink
                        to={PathOption.TECHNOLOGY_RADAR_PORTAL}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.TECHNOLOGY_RADAR_PORTAL)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        Inicio del Radar
                    </NavLink>

                    <NavLink
                        to={PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        Recomendaciones
                    </NavLink>

                    <NavLink
                        to={PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR}
                        className={`px-4 py-3 rounded-lg font-medium transition duration-300 hover:bg-white hover:text-blue-600 ${isActivePath(PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR)
                            ? 'bg-white text-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'text-white'
                            }`}
                        onClick={() => setSheetOpen(false)}
                    >
                        Radar
                    </NavLink>
                </>
            )}
        </div>
    );

    return (
        <header className={styles.header}>
            {/* Desktop Navigation */}
            {!isMobile && (
                <NavigationMenu viewport={false}>
                    <NavigationMenuList className={styles.navigationMenuList}>
                        {isVigitechView ? (
                            <>
                                {/* HOME */}
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink}
                                            ${currentPath === PathOption.VIGITECH_PORTAL_HOME &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.VIGITECH_PORTAL_HOME}>Inicio</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                {/* SERVICES */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className={styles.navigationMenuTrigger}>
                                        SERVICIOS
                                    </NavigationMenuTrigger>

                                    <NavigationMenuContent className="p-0">
                                        <ul className={styles.navigationMenuUl}>
                                            {servicesInfo.map(
                                                (item: { to: PathOption, service: ServiceCardProps }, index) => (
                                                    <li key={index}>
                                                        <NavigationMenuLink asChild>
                                                            <NavLink to={item.to}>
                                                                <ServiceCard
                                                                    imageSrc={item.service.imageSrc}
                                                                    title={item.service.title}
                                                                    alt={item.service.alt}
                                                                    description={item.service.description}
                                                                />
                                                            </NavLink>
                                                        </NavigationMenuLink>

                                                        {index < servicesInfo.length - 1 && separator}
                                                    </li>)
                                            )}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                {/* FAQ + ABOUT */}
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink} 
                                            ${currentPath === PathOption.VIGITECH_PORTAL_FAQ &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.VIGITECH_PORTAL_FAQ}>FAQ</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink} 
                                            ${currentPath === PathOption.VIGITECH_PORTAL_ABOUT &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.VIGITECH_PORTAL_ABOUT}>ACERCA DE</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </>
                        ) : (
                            <>
                                {/* Technology Radar layout */}
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={styles.secundaryNavigationMenuLink}
                                    >
                                        <NavLink to={PathOption.VIGITECH_PORTAL_HOME}>VIGITECH</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink} 
                                            ${currentPath === PathOption.TECHNOLOGY_RADAR_PORTAL &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.TECHNOLOGY_RADAR_PORTAL}>Inicio</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink} 
                                            ${currentPath === PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}>Recomendaciones</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={`${styles.navigationMenuLink} 
                                            ${currentPath === PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR &&
                                            styles.navigationMenuLinkFocused
                                            }`}>
                                        <NavLink to={PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR}>Radar</NavLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={styles.navigationMenuLink}
                                    >
                                        <NotificationCenter />
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </>
                        )}
                        <SignedOut>
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={`${styles.navigationMenuLink} important bg-blue-400 shadow-md shadow-blue-800 font-bold`}
                                >
                                    <SignInButton>Autenticarse</SignInButton>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </SignedOut>

                        <SignedIn>
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={styles.navigationMenuLink}
                                >
                                    <UserButton />
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </SignedIn>
                    </NavigationMenuList>
                </NavigationMenu>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        {/* Services Button for Vigitech View - SIMPLIFIED */}
                        {isVigitechView && (
                            <Button
                                className={styles.navigationMenuTrigger}
                                onClick={() => {
                                    // En móvil, mostramos los servicios en el Sheet
                                    setSheetOpen(true);
                                }}
                            >
                                SERVICIOS
                            </Button>
                        )}

                        {/* Vigitech Button for Radar View */}
                        {!isVigitechView && (
                            <NavLink
                                to={PathOption.VIGITECH_PORTAL_HOME}
                                className={styles.secundaryNavigationMenuLink}
                            >
                                VIGITECH
                            </NavLink>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* User Button */}
                        <SignedIn>
                            <UserButton />
                        </SignedIn>

                        <SignedOut>
                            <SignInButton>
                                <Button className={`${styles.navigationMenuLink} important bg-blue-400 shadow-md shadow-blue-800 font-bold text-sm`}>
                                    Autenticarse
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        {/* Mobile Menu Sheet */}
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 rounded-lg p-2 transition duration-300 ring-2 ring-white/20 hover:ring-white/40 backdrop-blur-sm"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="bg-gradient-to-b from-indigo-700 via-blue-600 to-sky-500 text-white border-none shadow-xl backdrop-blur-md"
                            >
                                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Menú de navegación principal de la aplicación
                                </SheetDescription>
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-white mb-6 px-4 text-center">
                                        {isVigitechView ? 'Vigitech Portal' : 'Radar Tecnológico'}
                                    </h3>
                                    <MobileMenuContent />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            )}

            {/* Settings Modal - siempre visible */}
            <SettingsModal />
        </header>
    )
}