import { 
    AuthError,
    AuthResponse,
    AuthTokenResponsePassword,
    OAuthResponse,
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
} from '@supabase/auth-js';

export interface AuthInterface {
    signInWithPassword: (
        credentials: SignInWithPasswordCredentials
    ) => Promise<AuthTokenResponsePassword | void>;

    signInWithOAuth: (
        credentials: SignInWithOAuthCredentials
    ) => Promise<OAuthResponse | void>;
    
    signUp: (
        credentials: SignUpWithPasswordCredentials
    ) => Promise<AuthResponse | void>;
    
    resetPassword: (
        email: string
    ) => Promise<{ data: object, error: null } | { data: null; error: AuthError } | void> ;
    
    signOut: () => Promise<{ error: AuthError | null } | void>;
}
