// store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    userItemListsReducer,
    changelogReducer,
    surveyItemsReducer
} from "./reducers";
import persistReducer from "redux-persist/es/persistReducer";
import storage from 'redux-persist/lib/storage';
import { persistStore } from "redux-persist";
import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

const surveyItemsPersistConfig = {
    key: 'surveyItems',
    storage,
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
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;