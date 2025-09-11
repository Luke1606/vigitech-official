import type { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    User,
} from '@supabase/supabase-js';

export interface AuthInterface {
    user: User | null;
    error: Error | null;

    signInWithPassword: (
        credentials: SignInWithPasswordCredentials
    ) => void;

    signInWithOAuth: (
        credentials: SignInWithOAuthCredentials
    ) => void;

    signInWithOtp: (
        email: string
    ) => void ;
    
    signUp: (
        credentials: SignUpWithPasswordCredentials
    ) => void;
    
    resetPassword: (
        email: string
    ) => void ;
    
    signOut: () => void;
}
