import React, { useState, type FormEvent } from "react";
import { useAuthProvider } from "../../auth-provider";
import { PathOption } from "@/routing";

export const SignUpForm: React.FC = () => {
    const { signInWithOAuth, signInWithOtp } = useAuthProvider();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');

    const handleLoginWithOtp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        await signInWithOtp(email);
        setLoading(false)
    }
    
    const siteUrl: string = import.meta.env.VITE_SITE_BASE_URL as string;
    
    return <>
        <button 
            type="button"
            onClick={
                async () => signInWithOAuth({
                    provider: 'github',
                    options: {
                        redirectTo: `${siteUrl}${PathOption.VIGITECH_CENTRALIZED_AUTH_CALLBACK}`
                    }
                })
            }>
            Sign Up With GitHub
        </button>

        <div className="row flex flex-center">
            <div className="col-6 form-widget">
                <p className="description">Sign up via magic link with your email below</p>
                
                <form className="form-widget" onSubmit={handleLoginWithOtp}>
                    <input
                        className="inputField"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        required={true}
                        onChange={(e) => setEmail(e.target.value)}
                        />

                    <button 
                        type="button"
                        className={'button block'} 
                        disabled={loading}>
                        {loading ? 
                            <span>Loading</span>
                            :
                            <span>Send magic link</span>}
                    </button>
                </form>
            </div>
        </div>
    </>;
};