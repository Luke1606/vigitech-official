import React, { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useMemo,
    useState
} from 'react';
import type { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    User,
    Subscription
} from '@supabase/auth-js';

import { AuthRepository, type AuthInterface } from '@/infrastructure';

interface AuthRepositoryProviderProps extends AuthInterface {
    session: User | null;
};

const AuthContext = createContext<AuthRepositoryProviderProps | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ session, setSession ] = useState<User | null>(null);
    
    const authRepositoryImpl: AuthRepository = useMemo(() => new AuthRepository(), []);

    const subscription: Subscription = useMemo(() => authRepositoryImpl.onAuthStateChange(setSession), [authRepositoryImpl]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const user: User | null = await authRepositoryImpl.fetchCurrentUser();
            console.log(user);
            if (user)
                setSession(user);
        } catch (error) {
            console.log(error);            
        }
    }, [authRepositoryImpl])
    
    useEffect(() => {
        fetchCurrentUser();

        return () => subscription.unsubscribe();
    }, [fetchCurrentUser, subscription]);

    const signUp = async (
        credentials: SignUpWithPasswordCredentials
    ): Promise<void> => {
        try {
            await authRepositoryImpl.signUp(credentials);
        } catch (error) {
            console.log(error);            
        }
    };
    
    const signInWithPassword = async (
        credentials: SignInWithPasswordCredentials
    ): Promise<void> => {
        try {
            await authRepositoryImpl.signInWithPassword(credentials);
        } catch (error) {
            console.log(error);
        }
    };

    const signInWithOAuth = async (
        credentials: SignInWithOAuthCredentials
    ): Promise<void> => {
        try {
            await authRepositoryImpl.signInWithOAuth(credentials);
        } catch (error) {
            console.log(error);
        }
    };

    const signInWithOtp = async (
        email: string
    ): Promise<void> => {
        try {
            await authRepositoryImpl.signInWithOtp(email);
        } catch (error) {
            console.log(error);
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            await authRepositoryImpl.signOut();
        } catch (error) {
            console.log(error);
        }
    };

    const resetPassword = async (
        email: string
    ): Promise<void> => {
        try {
            await authRepositoryImpl.resetPassword(email);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AuthContext.Provider 
			value={{
				session,
                fetchCurrentUser,
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

export const useAuthProvider = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthProvider debe usarse dentro de AuthProvider');
    return ctx;
};
