import { configureStore, type Reducer } from "@reduxjs/toolkit";
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
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;