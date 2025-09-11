import React, { useState, type FormEvent } from "react";
import { useAuthProvider } from "../../auth-provider";

export const SignUpForm: React.FC = () => {
    const { signInWithOAuth, signInWithOtp } = useAuthProvider();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');

    const handleLoginWithOtp = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        signInWithOtp(email);
        setLoading(false)
    }
    
    return <>
        <button 
            type="button"
            onClick={
                () => signInWithOAuth({ provider: 'github' })
            }>
            Sign up via GitHub
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