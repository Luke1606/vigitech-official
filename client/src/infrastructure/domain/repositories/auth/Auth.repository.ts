import { 
    User,
    AuthError,
    AuthResponse,
    OAuthResponse,
    AuthTokenResponsePassword,
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials
} from '@supabase/auth-js';

import type { AuthInterface } from '../../interfaces/Auth.interface';
import { AxiosConfiguredInstance } from '@/infrastructure/api';

export interface AuthRepositoryInterface extends AuthInterface {
    fetchCurrentUser: () => Promise<User | null>;
}

export class AuthRepository implements AuthRepositoryInterface {
    private static instance: AuthRepository;
    private readonly axios: AxiosConfiguredInstance = new AxiosConfiguredInstance(
        `${process.env.SERVER_BASE_URL}survey-items/`
    );

    constructor() {
        if (AuthRepository.instance) 
            return AuthRepository.instance;
        AuthRepository.instance = this;
    };
    
    async fetchCurrentUser (): Promise<User | null> {
        return await this.axios.http.get('session');
    };

    async signInWithPassword (
        credentials: SignInWithPasswordCredentials
    ): Promise<AuthTokenResponsePassword> {
        return await this.axios.http.post('sign-in-password', credentials);
    };

    async signInWithOAuth (
        credentials: SignInWithOAuthCredentials
    ): Promise<OAuthResponse> {
        return await this.axios.http.post('sign-in-oauth', credentials);
    };

    async signUp (
        credentials: SignUpWithPasswordCredentials
    ): Promise<AuthResponse> {
        return await this.axios.http.post('sign-up', credentials);
    };

    async resetPassword (
        email: string
    ): Promise<{ data: object; error: null; } | { data: null; error: AuthError; }> {
        return await this.axios.http.post('reset-password', email);
    };

    async signOut (): Promise<{ error: AuthError | null; }> {
        return await this.axios.http.post('sign-out');
    };
;
}