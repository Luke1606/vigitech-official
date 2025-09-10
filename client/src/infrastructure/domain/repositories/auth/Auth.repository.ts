import type { 
    AuthError,
    AuthResponse,
    OAuthResponse,
    AuthTokenResponsePassword,
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    UserResponse,
    SupabaseClient,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js'

import type { AuthInterface } from '../../interfaces/Auth.interface';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
console.log(supabaseAnonKey, supabaseUrl, import.meta.env.SERVER_BASE_URL);
export interface AuthRepositoryInterface extends AuthInterface {
    fetchCurrentUser: () => Promise<UserResponse>;
}

export class AuthRepository implements AuthRepositoryInterface {
    private static instance: AuthRepository;

    private readonly supabase: SupabaseClient = createClient(
		supabaseUrl,
		supabaseAnonKey,
		{
		auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false
			}
		}
	);

    constructor() {
        if (AuthRepository.instance) 
            return AuthRepository.instance;
        AuthRepository.instance = this;
    };
    
    async fetchCurrentUser (): Promise<UserResponse> {
		return await this.supabase.auth.getUser();
  	}

	async signInWithPassword (
		credentials: SignInWithPasswordCredentials
	) : Promise<AuthTokenResponsePassword> {
		return await this.supabase.auth.signInWithPassword(credentials);
	}

	async signInWithOAuth (
		credentials: SignInWithOAuthCredentials
	) : Promise<OAuthResponse> {
		return await this.supabase.auth.signInWithOAuth(credentials);
	};

	async signUp (
		credentials: SignUpWithPasswordCredentials
	) : Promise<AuthResponse> {
		return await this.supabase.auth.signUp(credentials);
	}

	async resetPassword (
		email: string
	) : Promise<{ data: object, error: null } | { data: null; error: AuthError }> {
		return await this.supabase.auth.resetPasswordForEmail(email);
	}

	async signOut () : Promise<{ error: AuthError | null }> {
		return await this.supabase.auth.signOut();
	}
}