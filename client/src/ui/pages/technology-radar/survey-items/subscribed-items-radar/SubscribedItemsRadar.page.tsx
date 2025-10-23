import { useState } from "react";
import { ItemListsSideBar, ChangeLogSideBar, Radar } from "../../../../components"
import { Blip } from "../../../../../infrastructure";
import blipsFromMock from '../../../../../assets/data/radarMock';

const blips: Blip[] = blipsFromMock as unknown as Blip[];

export const SubscribedItemsRadar = () => {
    const [
        itemListsSidebarVisible,
        setItemListsSidebarVisible
    ] = useState<boolean>(true);

    const [
        changeLogsSidebarVisible,
        setChangeLogsSidebarVisible
    ] = useState<boolean>(true);

    return (
        <div className="overflow-y-hidden overflow-x-hidden">
            <ItemListsSideBar
                visible={itemListsSidebarVisible}
                toggleVisible={
                    () => setItemListsSidebarVisible(!itemListsSidebarVisible)
                } />

            <Radar entries={blips}/>

            <ChangeLogSideBar
                visible={changeLogsSidebarVisible}
                toggleVisible={
                    () => setChangeLogsSidebarVisible(!changeLogsSidebarVisible)
                } />
        </div>
    )
}