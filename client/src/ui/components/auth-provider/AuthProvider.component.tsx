'use client'

import React, { 
    createContext, 
    useCallback, 
    useContext, 
    useEffect, 
    useMemo, 
    useState 
} from 'react';
import { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    User
} from '@supabase/auth-js';

import { AuthRepository, AuthInterface } from '../../../infrastructure';

export interface AuthRepositoryProviderProps extends AuthInterface {
    user: User | null;
}

const AuthContext = createContext<AuthRepositoryProviderProps | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ user, setUser ] = useState<User | null>(null);
    
    const authRepositoryImpl = useMemo(() => new AuthRepository(), []);

    const fetchUser = useCallback(async () => {
        const actualUser = await authRepositoryImpl.fetchCurrentUser();
        setUser(actualUser);
    }, [authRepositoryImpl])
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser])

    const signUp = async (credentials: SignUpWithPasswordCredentials): Promise<void> => {
        const { data, error } = await authRepositoryImpl.signUp(credentials);
        console.log(data, error);
    }
    
    const signInWithPassword = async (credentials: SignInWithPasswordCredentials): Promise<void> => {
        const { data, error } = await authRepositoryImpl.signInWithPassword(credentials);
        console.log(data, error);
    };

    const signInWithOAuth = async (credentials: SignInWithOAuthCredentials): Promise<void> => {
        const { data, error } = await authRepositoryImpl.signInWithOAuth(credentials);
        console.log(data, error);
    };

    const signOut = async (): Promise<void> => {
        const { error } = await authRepositoryImpl.signOut();
        console.log(error);
    };

    const resetPassword = async (email: string): Promise<void> => {
        const {data, error } = await authRepositoryImpl.resetPassword(email);
        console.log(data, error);
    };

    return (
        <AuthContext.Provider 
			value={{
				user,
                signUp,
				signInWithPassword,
				signInWithOAuth,
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
