import EmailPassword from "supertokens-auth-react/recipe/emailpassword"
import ThirdParty, { Google, Github, Gitlab, LinkedIn } from "supertokens-auth-react/recipe/thirdparty"
import Session from "supertokens-auth-react/recipe/session"
import type {SuperTokensConfig } from "supertokens-auth-react"

export const superTokensConfig: SuperTokensConfig = {
    appInfo: {
        appName: 'Vigitech',
        apiDomain: import.meta.env.VITE_SERVER_BASE_URL as string,
        apiBasePath: 'auth',
        websiteDomain: import.meta.env.VITE_SITE_BASE_URL as string,
        websiteBasePath: 'vigitech/auth',
    },
    recipeList: [
        EmailPassword.init(),
        ThirdParty.init({
            signInAndUpFeature: {
                providers: [
                    Google.init(),
                    Github.init(),
                    Gitlab.init(),
                    LinkedIn.init(),
                ]
            }
        }),
        Session.init(),
    ],
}