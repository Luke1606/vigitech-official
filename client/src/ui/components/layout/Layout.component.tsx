
import { Outlet, useLocation } from "react-router-dom"
import { PathOption } from "@/infrastructure";
import { Header } from "./header";
import { Footer } from "./footer";

export const Layout: React.FC = () => {

    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;

    return (
        <>
            <Header />

            <main className='mt-8 overflow-x-hidden'>
                <Outlet />
            </main>
            
            { ![ PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED,
                PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR
                ].includes(currentPath) && 
                <Footer />}
        </>
    )
}