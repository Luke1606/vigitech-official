import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthProvider } from '@/ui/components/auth-provider';
import { PathOption } from '@/routing';
import { AuthRepository } from '@/infrastructure';

export const AuthCallback: React.FC = () => {
    const { session, fetchCurrentUser } = useAuthProvider();

    const navigate = useNavigate();
    
    const auth = useMemo(() => new AuthRepository(), []);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (!code) return null;

            await auth.supabase.auth.exchangeCodeForSession(code);
            
            if (session) {
                navigate(PathOption.VIGITECH_PORTAL_HOME, { replace: true });
            } else {
                console.error('No se pudo obtener la sesión después del callback');
                navigate(PathOption.VIGITECH_CENTRALIZED_AUTH, { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate, session, fetchCurrentUser, auth]);

    return <div>Procesando inicio de sesión...</div>;
};