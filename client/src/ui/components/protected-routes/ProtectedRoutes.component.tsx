
import React from "react"
import { 
    // Navigate, 
    Outlet 
} from "react-router-dom";
// import { useAuthProvider } from "../auth-provider"
// import { PathOption } from "@/infrastructure";

export const ProtectedRoutes: React.FC = () => {
    // const { user } = useAuthProvider();
    
    // if (!user) {
    //     return <Navigate to={PathOption.VIGITECH_CENTRALIZED_AUTH}/>
    // }

    return <Outlet/>
}