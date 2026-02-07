import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SurveyItem } from '../../..';

export interface SurveyItemsState {
    surveyItems: SurveyItem[];
    pendingChanges: {
        toRemoveItems: SurveyItem[];
        toSubscribeItems: SurveyItem[];
        toUnsubscribeItems: SurveyItem[];
    }
}

const initialState: SurveyItemsState = {
    surveyItems: [],
    pendingChanges: {
        toRemoveItems: [],
        toSubscribeItems: [],
        toUnsubscribeItems: []
    }
};

export const surveyItemsSlice = createSlice({
    name: 'surveyItems',
    initialState,
    reducers: {
        addToSurveyItems: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            action.payload.forEach(
                (item: SurveyItem) => {
                    if (!state.surveyItems.includes(item))
                        state.surveyItems.push(item)
                }
            );
        },

        setSurveyItems: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            state.surveyItems = action.payload;
        },

        removeFromSurveyItems: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            state.surveyItems = state.surveyItems.filter(
                (item: SurveyItem) => action.payload.includes(item)
            )
        },

        addPendingSubscribes: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItem) => !state.pendingChanges.toSubscribeItems.includes(item)
            )
            state.pendingChanges.toSubscribeItems = state.pendingChanges
                .toSubscribeItems.concat(notReplicatedData);
        },

        addPendingUnsubscribes: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItem) => !state.pendingChanges.toUnsubscribeItems.includes(item)
            )
            state.pendingChanges.toUnsubscribeItems = state.pendingChanges
                .toUnsubscribeItems.concat(notReplicatedData);
        },

        addPendingRemoves: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItem) => !state.pendingChanges.toRemoveItems.includes(item)
            )
            state.pendingChanges.toRemoveItems = state.pendingChanges
                .toRemoveItems.concat(notReplicatedData);
        },

        clearPendingChanges: (state: SurveyItemsState) => {
            state.pendingChanges = {
                toSubscribeItems: [],
                toRemoveItems: [],
                toUnsubscribeItems: []
            };
        },
    },
});

export const {
    addToSurveyItems,
    setSurveyItems,
    removeFromSurveyItems,
    addPendingSubscribes,
    addPendingUnsubscribes,
    addPendingRemoves,
    clearPendingChanges,
} = surveyItemsSlice.actions;

export const surveyItemsReducer = surveyItemsSlice.reducer;