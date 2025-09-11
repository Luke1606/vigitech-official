import type { 
    SignUpWithPasswordCredentials, 
    SignInWithPasswordCredentials,
    SignInWithOAuthCredentials,
    SupabaseClient,
	User,
	Subscription,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js'

import type { AuthInterface } from '../../interfaces/Auth.interface';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const cookieStorage = {
  	getItem: (key: string): string | null => {
    	if (typeof document === 'undefined') return null;
		
		const cookies = document.cookie.split(';');
    	
		for (const cookie of cookies) {
			const [cookieKey, cookieValue] = cookie.trim().split('=');
      
			if (cookieKey === key) {
				return decodeURIComponent(cookieValue);
      		}
		}
    return null;
  	},
  	
	setItem: (key: string, value: string): void => {
    	if (typeof document === 'undefined') return;

		document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
	},

  	removeItem: (key: string): void => {
    	if (typeof document === 'undefined') return;
    	
		document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  	},
};

export class AuthRepository implements AuthInterface {
    private static instance: AuthRepository;
  	readonly supabase: SupabaseClient = createClient(
		supabaseUrl,
		supabaseAnonKey,
		{
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true,
				flowType: 'pkce',
				storage: cookieStorage
			}
		}
	);;

	constructor() {
		if (AuthRepository.instance) {
		return AuthRepository.instance;
		}

		

    	AuthRepository.instance = this;
  	}
    
    async fetchCurrentUser (): Promise<User | null> {
		const { data, error } = await this.supabase.auth.getSession();
		
		if (error)
			throw new Error(error.message, error);

		return data.session?.user || null;
  	}

	onAuthStateChange (callback: CallableFunction): Subscription {

		const { data: { subscription } } = this.supabase.auth.onAuthStateChange((_event, session) => {
			callback(session);
    	})
		return subscription;
	}

	async signInWithPassword (
		credentials: SignInWithPasswordCredentials
	) : Promise<void> {
		const { data, error } = await this.supabase.auth.signInWithPassword(credentials);
		
		if (error)
			throw new Error(error.message, error);

		console.log(data);
	}

	async signInWithOAuth (
		credentials: SignInWithOAuthCredentials
	) : Promise<void> {
		const { error } = await this.supabase.auth.signInWithOAuth(credentials);
		
		if (error)
			throw new Error(error.message, error);
	};

	async signInWithOtp (
		email: string
	) : Promise<void> {
		const { error } = await this.supabase.auth.signInWithOtp({ email })
		
		if (error)
			throw new Error(error.message, error);
	};
	
	async signUp (
		credentials: SignUpWithPasswordCredentials
	) : Promise<void> {
		const { data, error } = await this.supabase.auth.signUp(credentials);

		if (error)
			throw new Error(error.message, error);
		
		console.log(data);
	}

	async resetPassword (
		email: string
	) : Promise<void> {
		const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);

		if (error)
			throw new Error(error.message, error);
		console.log(data);
	}

	async signOut () : Promise<void> {
		const { error } = await this.supabase.auth.signOut();
		if (error)
			throw new Error(error.message, error);
	}
}