import { type RouteObject, Navigate } from "react-router-dom";
import { Layout } from "@/ui/components/layout";
import { 
    RootHome, 
    TechnologyRadarHome,
    FAQ,
    About,
    SubscribedItemsRadar
} from "@/ui/pages";

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <Navigate to="/vigitech-portal" replace />
    },
    {
        path: "vigitech-portal",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <RootHome />,
            },
            {
                path: "faq",
                element: <FAQ />
            },
            {
                path: "about",
                element: <About />
            },
            {
                path: "radar-portal",
                element: <TechnologyRadarHome />,
            },
            {
                path: "radar",
                element: <SubscribedItemsRadar />
            }
        ]
    },
];