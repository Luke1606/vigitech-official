import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SurveyItem } from '../../..';

export interface SurveyItemsState {
    selectedItems: SurveyItem[];
    pendingChanges: {
        toRemoveItems: SurveyItem[];
        toSubscribeItems: SurveyItem[];
        toUnsubscribeItems: SurveyItem[];
    }
}

const initialState: SurveyItemsState = {
    selectedItems: [],
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
        addToSelectedItems: (
            state: SurveyItemsState,
            action: PayloadAction<SurveyItem[]>
        ) => {
            action.payload.forEach(
                (item: SurveyItem) => {
                    if (!state.selectedItems.includes(item))
                        state.selectedItems.push(item)
                }
            );
        },

        removeFromSelectedItems: (
            state: SurveyItemsState, 
            action: PayloadAction<SurveyItem[]>
        ) => {
            state.selectedItems = state.selectedItems.filter(
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
    addToSelectedItems,
    removeFromSelectedItems, 
    addPendingSubscribes, 
    addPendingUnsubscribes,
    addPendingRemoves, 
    clearPendingChanges,
} = surveyItemsSlice.actions;

export const surveyItemsReducer = surveyItemsSlice.reducer;