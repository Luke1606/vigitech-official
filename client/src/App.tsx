
import { 
	createBrowserRouter, 
	RouterProvider, 
	type DataRouter 
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { AuthProvider } from "./ui/components";
import { queryClient, store } from "./infrastructure";
import { routes } from "./routing";

const router: DataRouter = createBrowserRouter(routes);

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</Provider>
		</QueryClientProvider>
	)
}

export default App
