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
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./infrastructure/redux/store";

const router: DataRouter = createBrowserRouter(routes);

const App = () => {
	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<SidebarProvider>
							<RouterProvider router={router} />
						</SidebarProvider>
					</PersistGate>
				</Provider>
			</QueryClientProvider>
		</ErrorBoundary>
	)
}

export default App;
