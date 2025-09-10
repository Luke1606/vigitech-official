import React from "react";
import { useAuthProvider } from "../../auth-provider";

export const SignUpForm: React.FC = () => {
    const { signInWithOAuth } = useAuthProvider()
    return <>
        <button 
            type="button"
            onClick={
                async () => signInWithOAuth({
                    provider: 'github',
                    options: {
                        redirectTo: import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URL
                    }
                })
            }>
            Sign Up With GitHub
        </button>
    </>;
};