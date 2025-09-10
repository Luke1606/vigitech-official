
import { Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";
import { SideBar } from "./sidebar/SideBar.component";
import { PathOption } from "@/routing";

export const Layout: React.FC = () => {

    const location = useLocation();
    const currentPath: PathOption = location.pathname as PathOption;

    return (
        <>
            <Header />
            {( currentPath === PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR ) ?
                <div className="min-h-screen md:flex md:flex-row flex-col justify-center items-center">
                    <SideBar />
                    <div className="md:w-44 md:h-screen w-screen h-28 bg-blue-600">
                    </div>
                    <main className="w-screen md:w-full h-[calc(100vh-7rem)] md:h-[calc(100vh-3.5rem)] md:mt-14 flex justify-center items-center">
                        <Outlet />
                    </main>
                </div >
                :
                <>
                    <main className="mt-8 overflow-x-hidden">
                        <Outlet />
                    </main>
                    <Footer />
                </>
            }
        </>
    )
}