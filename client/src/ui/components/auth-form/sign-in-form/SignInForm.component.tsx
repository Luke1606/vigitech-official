import React from "react";
import { useAuthProvider } from "../../auth-provider";
import { PathOption } from "@/routing";

export const SignInForm: React.FC = () => {
    const { signInWithOAuth } = useAuthProvider()

    const siteUrl: string = import.meta.env.VITE_SITE_BASE_URL as string;

    return <>
        <button 
            type="button"
            onClick={
                async () => signInWithOAuth({
                    provider: 'github',
                    options: {
				        redirectTo: `${siteUrl}${PathOption.VIGITECH_CENTRALIZED_AUTH_CALLBACK}`,
			        }
                })
            }>
            Sign In With GitHub
        </button>
    </>;
};