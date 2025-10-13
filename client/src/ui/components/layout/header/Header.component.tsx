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
} from "@/ui/components/shared/shadcn-ui/navigation-menu"
import { PathOption } from '@/infrastructure';
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
                title: 'Technology Radar',
                alt: 'Radar Service Home',
                description: 'Track and evaluate the caliber of global tech trends.'
            }
        },
        {
            to: '#' as PathOption,
            service: {
                imageSrc: '/vigitech_home_browser.jpg',
                title: 'Technology Browser',
                alt: 'Browser Service Home',
                description: 'Find insights about all kinds of technologies.'
            }
        },
        {
            to: '#' as PathOption,
            service: {
                imageSrc: '/vigitech_home_graphics.jpg',
                title: 'Technology Graphics',
                alt: 'Graphics Service Home',
                description: 'Analyze global tech trends and their impact through data visualizations.'
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
                                    SERVICES
                                </NavigationMenuTrigger>

                                <NavigationMenuContent className="p-0">
                                    <ul className={styles.navigationMenuUl}>
                                        {/* Items */}
                                        { servicesInfo.map(
                                            (item: {to: PathOption, service: ServiceCardProps}, index) => (
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
                                    <NavLink to={PathOption.VIGITECH_PORTAL_HOME}>Vigitech</NavLink>
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
                                    <NavLink to={PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}>Feed</NavLink>
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