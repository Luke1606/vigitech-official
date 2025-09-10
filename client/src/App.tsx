
import { createBrowserRouter, RouterProvider, type DataRouter } from "react-router-dom";
import { routes } from "./routing";
import { AuthProvider } from "./ui/components/auth-provider";

const router: DataRouter = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
