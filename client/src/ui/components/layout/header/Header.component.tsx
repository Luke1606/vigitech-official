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
import { PathOption } from '@/infrastructure';
import { NotificationCenter } from '../../notification-center';
import { Profile } from './profile';
import styles from './Header.styles';

export const Header: React.FC = () => {
    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;

    const separator = <div className={styles.separator}></div>

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
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <NavLink to={PathOption.TECHNOLOGY_RADAR_PORTAL}>
                                                    <Card 
                                                        imageSrc='/vigitech_home_radar.jpg'
                                                        title='Technology Radar'
                                                        alt='Radar Service Home'
                                                        description='Track and evaluate the caliber of global tech trends.'
                                                        />
                                                </NavLink>
                                            </NavigationMenuLink>
                                        </li>

                                        {separator}
                                        
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <NavLink to="#">
                                                    <Card 
                                                        imageSrc='/vigitech_home_browser.jpg'
                                                        title='Technology Browser'
                                                        alt='Browser Service Home'
                                                        description='Find insights about all kinds of technologies.'
                                                        />
                                                </NavLink>
                                            </NavigationMenuLink>
                                        </li>

                                        {separator}
                                        
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <NavLink to="#">
                                                    <Card 
                                                        imageSrc='/vigitech_home_graphics.jpg'
                                                        title='Technology Graphics'
                                                        alt='Graphics Service Home'
                                                        description='Analyze global tech trends and their impact through data visualizations.'
                                                        />
                                                </NavLink>
                                            </NavigationMenuLink>
                                        </li>
                                        {separator}
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
                            <Profile />
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header >
    )
}

const Card: React.FC<{
    imageSrc: string,
    title: string,
    alt: string,
    description: string
}> = ({
    imageSrc,
    title,
    alt,
    description,
}) => {
    return (
        <figure className='flex justify-between items-center gap-x-5'>
            <img 
                className='w-20 h-20'
                src= {imageSrc}
                title={title}
                alt={alt} 
                />

            <figcaption>
                <caption className="font-semibold text-base sm:text-lg">
                    {title}
                </caption>

                <p className="text-sm text-gray-700">
                    {description}
                </p>
            </figcaption>
        </figure>
    )
}