import { configureStore } from "@reduxjs/toolkit";
import { 
    itemListReducer,
    changelogReducer,
    surveyItemsReducer
} from "./reducers";

export const store = configureStore({
    reducer: {
        itemLists: itemListReducer,
        changelog: changelogReducer,
        surveyItems: surveyItemsReducer,
    }
})