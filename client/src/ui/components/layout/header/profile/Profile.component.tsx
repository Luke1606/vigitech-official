import React from 'react';
import { User } from 'lucide-react';
import styles from './Profile.styles.js';
import { useAuthProvider } from '@/ui/components/auth-provider';
import { Link } from 'react-router-dom';
import { PathOption } from '@/routing/Paths.enum.js';
import { AuthAction } from '@/infrastructure/index.js';

export const Profile: React.FC = () => {
	const { session, signOut} = useAuthProvider();
	
	return (
		<div>
            { session ?
				<>
					<figure className={styles.figure}>
						<User className={styles.icon} />
						<h2>{session?.email || session?.phone}</h2>
					</figure>

					<button
						type='button'
						onClick={signOut}>
						Logout
					</button>
				</>
				:
				<>
					<Link 
						to={`${PathOption.VIGITECH_CENTRALIZED_AUTH}/${AuthAction.SIGN_IN}`}>
						Sign In
					</Link>
					
					<Link 
						to={`${PathOption.VIGITECH_CENTRALIZED_AUTH}/${AuthAction.SIGN_UP}`}>
						Sign Up
					</Link>
				</>
			}
        </div>
	);
};