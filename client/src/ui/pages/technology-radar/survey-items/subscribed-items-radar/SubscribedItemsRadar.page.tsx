import { useState } from "react";
import { ItemListsSideBar, ChangeLogSideBar, Radar } from "@/ui/components"

export const SubscribedItemsRadar = () => {
    const [
        itemListsSidebarVisible, 
        setItemListsSidebarVisible 
    ] = useState<boolean>(false);
    
    const [
        changeLogsSidebarVisible, 
        setChangeLogsSidebarVisible 
    ] = useState<boolean>(false);

    return (
        <>
            <ItemListsSideBar
                visible={itemListsSidebarVisible}
                toggleVisible={
                    () => setItemListsSidebarVisible(!itemListsSidebarVisible)
                }/>

            <Radar/>

            <ChangeLogSideBar
                visible={changeLogsSidebarVisible}
                toggleVisible={
                    () => setChangeLogsSidebarVisible(!changeLogsSidebarVisible)
                }/>
        </>
    )
}