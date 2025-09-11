import type { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    User,
} from '@supabase/supabase-js';

export interface AuthInterface {
    signInWithPassword: (
        credentials: SignInWithPasswordCredentials
    ) => Promise<void>;

    signInWithOAuth: (
        credentials: SignInWithOAuthCredentials
    ) => Promise<void>;

    signInWithOtp: (
        email: string
    ) => Promise<void> ;
    
    signUp: (
        credentials: SignUpWithPasswordCredentials
    ) => Promise<void>;
    
    resetPassword: (
        email: string
    ) => Promise<void> ;
    
    signOut: () => Promise<void>;

    fetchCurrentUser: () => Promise<User | null | void>;
}
