import { useState } from "react";
import { ItemListsSideBar, ChangeLogSideBar, Radar } from "@/ui/components"
import { useSurveyItems } from "@/infrastructure";

export const SubscribedItemsRadar = () => {
    const [
        itemListsSidebarVisible,
        setItemListsSidebarVisible
    ] = useState<boolean>(true);

    const [
        changeLogsSidebarVisible,
        setChangeLogsSidebarVisible
    ] = useState<boolean>(true);

    const { recommended, subscribed } = useSurveyItems();
    console.log(recommended.data, subscribed.data);
    return (
        <div className="flex justify-between">
            <ItemListsSideBar
                visible={itemListsSidebarVisible}
                toggleVisible={
                    () => setItemListsSidebarVisible(!itemListsSidebarVisible)
                } />

            <Radar />

            <ChangeLogSideBar
                visible={changeLogsSidebarVisible}
                toggleVisible={
                    () => setChangeLogsSidebarVisible(!changeLogsSidebarVisible)
                } />
        </div>
    )
}