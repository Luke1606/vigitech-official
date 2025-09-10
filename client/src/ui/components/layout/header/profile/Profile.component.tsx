'use client'

import { useState, ReactNode, FC } from 'react';
import { User, Settings } from 'lucide-react';
import Link from 'next/link';
import styles from './Profile.styles.js';

interface ProfileMenuItemProps {
  children: ReactNode;
}

const ProfileMenuItem: FC<ProfileMenuItemProps> = ({ children }) => {
	return (
		<li className={styles.li}>
			{children}
		</li>
	);
};

interface ProfileMenuItemData {
  label: string;
  href: string;
  icon: ReactNode;
};

interface ProfileProps {
  menuItems?: ProfileMenuItemData[];
};

const defaultMenu: ProfileMenuItemData[] = [
  	{
    	label: 'Notificaciones',
    	href: '/notifications',
    	icon: <img src="/notificacion_faq.png" className="w-6 h-6" alt="Notificaciones" />,
  	},
  	{
	    label: 'Configuración',
    	href: '/config',
    	icon: <Settings className="w-6 h-6" />,
  	},
];

export const Profile: FC<ProfileProps> = ({ menuItems = defaultMenu }) => {
    const [userMenuVisible, setUserMenuVisible] = useState<boolean>(false);

    const toggleAvatarMenu = (): void => setUserMenuVisible(!userMenuVisible);

	return (
		<div className={styles.container} onClick={toggleAvatarMenu}>
			{userMenuVisible &&
                <ul className={`${styles.ul} ${userMenuVisible && "animate-fade-in"}`}>
                    {menuItems.map((item) => (
						<ProfileMenuItem>
							{item.icon}
							<Link href={item.href} className="ml-2">
								{item.label}
							</Link>
						</ProfileMenuItem>
          			))}
                </ul>
            }
            <figure className={styles.figure}>
                <User className={styles.icon} />
            </figure>
        </div>
	);
};