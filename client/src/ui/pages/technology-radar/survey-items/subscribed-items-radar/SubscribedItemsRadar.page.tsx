import { useEffect, useState } from "react";
import { ItemListsSideBar, ChangeLogSideBar, Radar } from "../../../../components"
import { useSurveyItemsAPI } from "../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook";
import { SurveyItem, useSurveyItems, RadarQuadrant, RadarRing } from "../../../../../infrastructure";
import blips from "../../../../../assets/data/radarMock";

const entriesMock: SurveyItem[] = blips as unknown as SurveyItem[];

const mapApiQuadrantToEnum = (apiValue: string): RadarQuadrant => {
    switch (apiValue) {
        case 'LANGUAGES_AND_FRAMEWORKS':
            return RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
        case 'BUSSINESS_INTEL':
            return RadarQuadrant.BUSSINESS_INTEL;
        case 'SCIENTIFIC_STAGE':
            return RadarQuadrant.SCIENTIFIC_STAGE;
        case 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES':
            return RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES;
        default:
            console.warn(`Unknown quadrant from API: ${apiValue}`);
            return RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
    }
};

// Función para mapear valores de anillos de la API a los enums
const mapApiRingToEnum = (apiValue: string): RadarRing => {
    switch (apiValue) {
        case 'ADOPT':
            return RadarRing.ADOPT;
        case 'TEST':
            return RadarRing.TEST;
        case 'SUSTAIN':
            return RadarRing.SUSTAIN;
        case 'HOLD':
            return RadarRing.HOLD;
        default:
            console.warn(`Unknown ring from API: ${apiValue}`);
            return RadarRing.SUSTAIN;
    }
};

// Función para transformar datos de la API al formato esperado
const transformApiData = (apiData: any[]): SurveyItem[] => {
    if (!apiData || !Array.isArray(apiData)) {
        return [];
    }

    return apiData.map(item => ({
        ...item,
        itemField: mapApiQuadrantToEnum(item.itemField),
        latestClassification: {
            ...item.latestClassification,
            classification: mapApiRingToEnum(item.latestClassification.classification)
        }
    }));
};

export const SubscribedItemsRadar = () => {
    const [
        itemListsSidebarVisible,
        setItemListsSidebarVisible
    ] = useState<boolean>(true);

    const [
        changeLogsSidebarVisible,
        setChangeLogsSidebarVisible
    ] = useState<boolean>(true);

    const { setSurveyItems } = useSurveyItems()
    const query = useSurveyItemsAPI();

    useEffect(() => {
        const { data } = query.subscribed;
        console.log("Datos crudos de la API:", data);

        if (data) {
            // Transformar los datos de la API antes de guardarlos
            const transformedData = transformApiData(data);
            console.log("Datos transformados de la API:", transformedData);
            setSurveyItems(transformedData);
        } else {
            // Si no hay datos de la API, usar los datos mock (para desarrollo)
            console.log("Usando datos mock");
            setSurveyItems(entriesMock);
        }
    }, []) // Ejecutar solo una vez al montar

    return (
        <div className="overflow-y-hidden overflow-x-hidden">
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