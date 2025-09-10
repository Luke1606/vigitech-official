import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

enum AuthActions {
  SIGN_IN,
  SIGN_UP,
  RESET_PASSWORD,
}

const AuthViewMap: Record<AuthActions, React.FC> = {
  [AuthActions.SIGN_IN]: lazy(() =>
    import('./sign-in-form/index.js').then((module) => ({ default: module.SignInForm }))
  ),
  [AuthActions.SIGN_UP]: lazy(() =>
    import('./sign-up-form/index.js').then((module) => ({ default: module.SignUpForm }))
  ),
  [AuthActions.RESET_PASSWORD]: lazy(() =>
    import('./reset-password-form/index.js').then((module) => ({ default: module.ResetPasswordForm }))
  ),
};

export const AuthForm: React.FC = () => {
  const [authAction, setAuthAction] = useState<AuthActions>(
    AuthActions.SIGN_IN
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

      {authAction === AuthActions.SIGN_IN && (
        <p>
          ¿Olvidó su contraseña?
          <span onClick={() => setAuthAction(AuthActions.RESET_PASSWORD)}>
            Reestablecer contraseña
          </span>
        </p>
      )}

      {authAction !== AuthActions.SIGN_UP && (
        <p>
          ¿No tiene una cuenta?
          <span onClick={() => setAuthAction(AuthActions.SIGN_UP)}>
            Registrarse
          </span>
        </p>
      )}

      {authAction !== AuthActions.SIGN_IN && (
        <p>
          ¿Ya tiene una cuenta?
          <span onClick={() => setAuthAction(AuthActions.SIGN_IN)}>
            Iniciar sesión
          </span>
        </p>
      )}
    </>
  );
};
