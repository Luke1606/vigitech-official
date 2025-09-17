import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

import styles from './Profile.styles.js';
import { useAuthProvider } from '@/ui/components';
import { AuthAction, PathOption } from '@/infrastructure';

export const Profile: React.FC = () => {
	const { user, signOut } = useAuthProvider();
	
	const displayName = user?.email || user?.user_metadata?.user_name;
	const avatarImageUrl = user?.user_metadata?.avatar_url

	return (
		<div className={styles.container}>
            { user ?
				<div className={styles.subcontainer}>
					{  avatarImageUrl ?
						<img
							className={styles.icon} 
							src={avatarImageUrl} 
							alt="User Avatar" />
						:
						<User 
							className={styles.icon} />
					}
					<h2>{ displayName }</h2>

					<button
						type='button'
						onClick={signOut}>
						Logout
					</button>
				</div>
				:
				<div className={styles.subcontainer}>
					<Link 
						to={`${PathOption.VIGITECH_CENTRALIZED_AUTH}/${AuthAction.SIGN_IN}`}>
						Sign In
					</Link>
					
					<Link 
						to={`${PathOption.VIGITECH_CENTRALIZED_AUTH}/${AuthAction.SIGN_UP}`}>
						Sign Up
					</Link>
				</div> }
        </div>
	);
};