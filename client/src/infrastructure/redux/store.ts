import { configureStore } from "@reduxjs/toolkit";
import { surveyItemsReducer } from "./reducers";

export const store = configureStore({
    reducer: {
        surveyItems: surveyItemsReducer,
    }
})