import { useState } from "react";
import { ItemListsSideBar, ChangeLogSideBar, Radar } from "../../../../components";

export const SubscribedItemsRadar = () => {
    const [itemListsSidebarVisible, setItemListsSidebarVisible] = useState(true);
    const [changeLogsSidebarVisible, setChangeLogsSidebarVisible] = useState(true);

    return (
        <div className="overflow-y-hidden overflow-x-hidden">
            <ItemListsSideBar
                visible={itemListsSidebarVisible}
                toggleVisible={() => setItemListsSidebarVisible(!itemListsSidebarVisible)}
            />

            <Radar />

            <ChangeLogSideBar
                visible={changeLogsSidebarVisible}
                toggleVisible={() => setChangeLogsSidebarVisible(!changeLogsSidebarVisible)}
            />
        </div>
    );
};