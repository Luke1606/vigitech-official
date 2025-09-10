import { type RouteObject, Navigate } from "react-router-dom";
import { Layout } from "@/ui/components/layout";
import { 
    PortalHome, 
    FAQ,
    About,
    TechnologyRadarHome,
    SubscribedItemsRadar
} from "@/ui/pages";

const portalGlobalPrefix = "portal/";
const technologyRadarGlobalPrefix = "technology-radar/";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Navigate to="/vigitech/portal" replace />
    },
    {
        path: "/vigitech",
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
                element: <TechnologyRadarHome />
            },
            {
                path: `${technologyRadarGlobalPrefix}subscribed-items-radar`,
                element: <SubscribedItemsRadar />
            }
        ]
    },
];