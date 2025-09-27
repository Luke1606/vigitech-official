import { 
	createBrowserRouter, 
	RouterProvider, 
	type DataRouter 
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import * as reactRouterDom from 'react-router-dom';
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";

import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";

import { superTokensConfig, queryClient, store } from "./infrastructure";
import { routes } from "./routing";

SuperTokens.init(superTokensConfig);


const router: DataRouter = createBrowserRouter([
	...routes,
	...getSuperTokensRoutesForReactRouterDom(reactRouterDom,
        [
			EmailPasswordPreBuiltUI,
            ThirdPartyPreBuiltUI
        ]
    ).map((route) => route.props)
]);

function App() {
	return (
		<SuperTokensWrapper>
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<RouterProvider router={router} />
				</Provider>
			</QueryClientProvider>
		</SuperTokensWrapper>
	)
}

export default App;
