
import React from "react"
import { Navigate, Outlet } from "react-router-dom";
import { useAuthProvider } from "../auth-provider"
import { PathOption } from "@/routing";

export const ProtectedRoutes: React.FC = () => {
    const { session } = useAuthProvider();
    
    if (!session) {
        return <Navigate to={PathOption.VIGITECH_CENTRALIZED_AUTH}/>
    }

    return <Outlet/>
}