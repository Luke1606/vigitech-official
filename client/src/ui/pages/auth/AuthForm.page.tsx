import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { AuthAction } from '@/infrastructure';

const AuthViewMap: Record<AuthAction, React.FC> = {
  [AuthAction.SIGN_IN]: lazy(() =>
    import('@/ui/components/auth-form/sign-in-form/index.js').then((module) => ({ default: module.SignInForm }))
  ),
  [AuthAction.SIGN_UP]: lazy(() =>
    import('@/ui/components/auth-form/sign-up-form/index.js').then((module) => ({ default: module.SignUpForm }))
  ),
  [AuthAction.RESET_PASSWORD]: lazy(() =>
    import('@/ui/components/auth-form/reset-password-form/index.js').then((module) => ({ default: module.ResetPasswordForm }))
  ),
};

export const AuthForm: React.FC = () => {

	const { action } = useParams();

  	const [authAction, setAuthAction] = useState<AuthAction>(
    	action as AuthAction || AuthAction.SIGN_IN
  	);
	
  	const AuthViewComponent = AuthViewMap[authAction];

  	return (
		<>
			<Suspense fallback={<span>Cargando...</span>}>
				<AnimatePresence>
				<motion.div
					key={authAction}
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -16 }}
					transition={{ duration: 0.25 }}
				>
					<AuthViewComponent />
				</motion.div>
				</AnimatePresence>
			</Suspense>

			{authAction === AuthAction.SIGN_IN && (
				<p>
				¿Olvidó su contraseña?
				<span onClick={() => setAuthAction(AuthAction.RESET_PASSWORD)}>
					Reestablecer contraseña
				</span>
				</p>
			)}

			{authAction !== AuthAction.SIGN_UP && (
				<p>
				¿No tiene una cuenta?
				<span onClick={() => setAuthAction(AuthAction.SIGN_UP)}>
					Registrarse
				</span>
				</p>
			)}

			{authAction !== AuthAction.SIGN_IN && (
				<p>
				¿Ya tiene una cuenta?
				<span onClick={() => setAuthAction(AuthAction.SIGN_IN)}>
					Iniciar sesión
				</span>
				</p>
			)}
		</>
	);
};
