import { type RouteObject, Navigate } from "react-router-dom";
import { Layout, Error, ProtectedRoutes } from "@/ui/components";
import { PathOption } from './Paths.enum';
import { 
    AuthForm,
    AuthCallback,
    PortalHome, 
    FAQ,
    About,
    TechnologyRadarHome,
    SubscribedItemsRadar,
} from "@/ui/pages";

const vigitechGlobalPrefix: string = "/vigitech";
const portalGlobalPrefix: string = "portal/";
const technologyRadarGlobalPrefix: string = "technology-radar/";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Navigate to={PathOption.VIGITECH_PORTAL_HOME} replace />
    },
    {
        path: PathOption.VIGITECH_CENTRALIZED_AUTH_CALLBACK,
        element: <AuthCallback />
    },
    {
        path: `${PathOption.VIGITECH_CENTRALIZED_AUTH}/:action`,
        element: <AuthForm />
    },
    {
        path: vigitechGlobalPrefix,
        element: <Layout />,
        children: [
            {
                path: portalGlobalPrefix,
                element: <PortalHome />
            },
            {
                path: `${portalGlobalPrefix}faq`,
                element: <FAQ />
            },
            {
                path: `${portalGlobalPrefix}about`,
                element: <About />
            },
            {
                path: technologyRadarGlobalPrefix,
                element: 
                <TechnologyRadarHome />
            },
            {
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: `${technologyRadarGlobalPrefix}subscribed-items-radar`,
                        element: <SubscribedItemsRadar />
                    }
                ]
            }
        ]
    },
    {
        path: '*',
        element: (
            <Error
                errorTitle='Dirección no encontrada'
                errorDescription='La ruta especificada no corresponde a ninguna dirección. Verifique la ruta.'
            />
    )},
];