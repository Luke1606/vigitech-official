import React, { 
    createContext, 
    useContext, 
    useEffect, 
    useState
} from 'react';
import type { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    User,
} from '@supabase/auth-js';

import { type AuthInterface, Supabase } from '@/infrastructure';


const AuthContext = createContext<AuthInterface | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ error, setError ] = useState<Error | null>(null);

    useEffect(() => {
        Supabase.auth.getSession().then(
            ({ data: { session }, error }) => {
                if (error)
                    setError(error);
                else
                    setUser(session?.user ?? null);
                console.log(session, error);
            });
        
        const { data: { subscription } } = Supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null)
        )

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (error)
            console.error(error);
    }, [error]);

    const signUp = (
        credentials: SignUpWithPasswordCredentials
    ):void => {
        Supabase.auth.signUp(credentials).then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };
    
    const signInWithPassword = (
        credentials: SignInWithPasswordCredentials
    ):void => {
        Supabase.auth.signInWithPassword(credentials).then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };

    const signInWithOAuth = (
        credentials: SignInWithOAuthCredentials
    ):void => {
        Supabase.auth.signInWithOAuth(credentials).then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };

    const signInWithOtp = (
        email: string
    ):void => {
        Supabase.auth.signInWithOtp({ email }).then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };

    const signOut = ():void => {
        Supabase.auth.signOut().then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };

    const resetPassword = (
        email: string
    ):void => {
        Supabase.auth.resetPasswordForEmail(email).then(
            ({ error }) => {
                if (error) setError(error);
            }
        );
    };

    return (
        <AuthContext.Provider 
			value={{
				user,
                error,
                signUp,
				signInWithPassword,
				signInWithOAuth,
                signInWithOtp,
				signOut,
                resetPassword
			}}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthProvider = (): AuthInterface => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthProvider debe usarse dentro de AuthProvider');
    return ctx;
};
