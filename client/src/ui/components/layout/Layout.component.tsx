
import { Outlet, useLocation } from "react-router-dom"
import { PathOption } from "../../../infrastructure";
import { Header } from "./header";
import { Footer } from "./footer";

export const Layout: React.FC = () => {

    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;

    return (

        <div className="flex flex-col min-h-screen min-w-screen overflow-x-hidden">
            <Header />

            <main className='lg:mt-10 mt-0'>
                <Outlet />
            </main>

            {
                ![PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED,
                PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR
                ].includes(currentPath) &&
                <Footer />

            }
        </div>

    )
}