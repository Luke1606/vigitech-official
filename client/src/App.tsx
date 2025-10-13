import { 
	createBrowserRouter, 
	RouterProvider, 
	type DataRouter 
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { 
	queryClient, 
	store 
} from "./infrastructure";
import { routes } from "./routing";
import { ErrorBoundary, SidebarProvider } from "./ui/components";

const router: DataRouter = createBrowserRouter(routes);

const App = () => {
	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<SidebarProvider>
						<RouterProvider router={router} />
					</SidebarProvider>
				</Provider>
			</QueryClientProvider>
		</ErrorBoundary>
	)
}

export default App;
