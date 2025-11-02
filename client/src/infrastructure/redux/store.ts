import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    userItemListsReducer,
    changelogReducer,
    surveyItemsReducer
} from "./reducers";
import storage from 'redux-persist/lib/storage';
import persistReducer from "redux-persist/es/persistReducer";
import { persistStore } from "redux-persist";

const surveyItemsPersistConfig = {
    key: 'surveyItems',
    storage
}

const userItemListsPersistConfig = {
    key: 'userItemLists',
    storage
}

const changeLogPersistConfig = {
    key: 'changeLog',
    storage
}

const rootReducer = combineReducers({
    surveyItems: persistReducer(surveyItemsPersistConfig, surveyItemsReducer),
    userItemLists: persistReducer(userItemListsPersistConfig, userItemListsReducer),
    changeLog: persistReducer(changeLogPersistConfig, changelogReducer)
});

export const store = configureStore({
    reducer: rootReducer
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;