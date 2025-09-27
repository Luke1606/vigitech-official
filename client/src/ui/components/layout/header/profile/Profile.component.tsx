// Profile.tsx
import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'supertokens-auth-react/recipe/session';

import { useUser, PathOption } from '@/infrastructure';
import styles from './Profile.styles.js';
import { Button } from '@/ui/components';

export const Profile: React.FC = () => {
	const { user, isLoading, isAuthenticated } = useUser();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await signOut();
			navigate(PathOption.VIGITECH_PORTAL_HOME);
			console.log('Sesión cerrada correctamente');
		} catch (error) {
			console.error('Error al cerrar sesión:', error);
		}
	};

	if (isLoading) {
		return (
		<div className={styles.container}>
			<div className={styles.subcontainer}>
			<span>Cargando...</span>
			</div>
		</div>
		);
	}

	if (isAuthenticated && user) {
		return (
		<div className={styles.container}>
			<div className={styles.subcontainer}>
				<User className={styles.icon} />
		
				<div className={styles.userInfo}>
					<h2 className={styles.displayName}>{user.name}</h2>
					<p className={styles.email}>{user.email}</p>
				</div>
		
				<button
					type='button'
					onClick={handleSignOut}
					className={styles.logoutButton}>
					Sign out
				</button>
			</div>
		</div>
		);
	}

	// Usuario no autenticado
	return (
		<div className={styles.container}>
			<div className={styles.subcontainer}>
				<Button
					type="button"
					onClick={() => navigate(PathOption.VIGITECH_CENTRALIZED_AUTH)}
					className={styles.signInButton}>
					Sign in
				</Button>
			</div>
		</div>
	);
};