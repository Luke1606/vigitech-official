import { type RouteObject, Navigate } from "react-router-dom";
import { PathOption } from '../infrastructure';
import { Layout, Error, ProtectedRoutes } from "../ui/components";
import {
    PortalHome,
    FAQ,
    About,
    TechnologyRadarHome,
    SubscribedItemsRadar,
    RecommendationsFeed,
    ItemDetails
} from "../ui/pages";

const vigitechGlobalPrefix: string = "vigitech";
const portalGlobalPrefix: string = "portal/";
const technologyRadarGlobalPrefix: string = "technology-radar/";

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to={PathOption.VIGITECH_PORTAL_HOME} replace />
    },
    {
        path: vigitechGlobalPrefix,
        element: <Navigate to={PathOption.VIGITECH_PORTAL_HOME} replace />
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
                        path: `${technologyRadarGlobalPrefix}recommendations-feed`,
                        element: <RecommendationsFeed />
                    },
                    {
                        path: `${technologyRadarGlobalPrefix}subscribed-items-radar`,
                        element: <SubscribedItemsRadar />
                    },
                    {
                        path: `${technologyRadarGlobalPrefix}item-details/:id`,
                        element: <ItemDetails />
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
        )
    },
];