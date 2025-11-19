import React from 'react'
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
import { PathOption } from '../../../../infrastructure';
import { NotificationCenter } from '../../notification-center';
import styles from './Header.styles';
import { ServiceCard, type ServiceCardProps } from './service-card';

export const Header: React.FC = () => {
    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;

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

    return (
        <header className={styles.header}>
            <NavigationMenu viewport={false}>
                <NavigationMenuList className={styles.navigationMenuList}>
                    {(
                        currentPath === PathOption.VIGITECH_PORTAL_HOME ||
                        currentPath === PathOption.VIGITECH_PORTAL_FAQ ||
                        currentPath === PathOption.VIGITECH_PORTAL_ABOUT ||
                        currentPath === PathOption.VIGITECH_PORTAL_CTA
                    ) ? (
                        <>
                            {/* HOME */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={`${styles.navigationMenuLink}
                                        ${currentPath === PathOption.VIGITECH_PORTAL_HOME &&
                                        styles.navigationMenuLinkFocused
                                        }`}>
                                    <NavLink to={PathOption.VIGITECH_PORTAL_HOME}>HOME</NavLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* SERVICES */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className={styles.navigationMenuTrigger}>
                                    SERVICIOS
                                </NavigationMenuTrigger>

                                <NavigationMenuContent className="p-0">
                                    <ul className={styles.navigationMenuUl}>
                                        {/* Items */}
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

                                                    {separator}
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
                                        styles.navigationMenuLinkFocused}
                                        }`}>
                                    <NavLink to={PathOption.VIGITECH_PORTAL_FAQ}>FAQ</NavLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={`${styles.navigationMenuLink} 
                                        ${currentPath === PathOption.VIGITECH_PORTAL_ABOUT &&
                                        styles.navigationMenuLinkFocused}
                                        }`}>
                                    <NavLink to={PathOption.VIGITECH_PORTAL_ABOUT}>ABOUT</NavLink>
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
                                        styles.navigationMenuLinkFocused}
                                        }`}>
                                    <NavLink to={PathOption.TECHNOLOGY_RADAR_PORTAL}>Home</NavLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={`${styles.navigationMenuLink} 
                                        ${currentPath === PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED &&
                                        styles.navigationMenuLinkFocused}
                                        }`}>
                                    <NavLink to={PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}>Recomedaciones</NavLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={`${styles.navigationMenuLink} 
                                        ${currentPath === PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR &&
                                        styles.navigationMenuLinkFocused}
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

                    <NavigationMenuItem>
                        <NavigationMenuLink
                            asChild
                            className={styles.navigationMenuLink}
                        >
                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink
                            asChild
                            className={styles.navigationMenuLink}
                        >
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header >
    )
}