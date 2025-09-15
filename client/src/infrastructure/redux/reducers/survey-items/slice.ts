import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SurveyItemDto } from '@/infrastructure';

export interface SurveyItemsState {
    selectedItems: SurveyItemDto[];
    pendingChanges: {
        toRemoveItems: SurveyItemDto[];
        toSubscribeItems: SurveyItemDto[];
        toUnsubscribeItems: SurveyItemDto[];
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
            action: PayloadAction<SurveyItemDto[]>
        ) => {
            action.payload.forEach(
                (item: SurveyItemDto) => {
                    if (!state.selectedItems.includes(item))
                        state.selectedItems.push(item)
                }
            );
        },

        removeFromSelectedItems: (
            state: SurveyItemsState, 
            action: PayloadAction<SurveyItemDto[]>
        ) => {
            state.selectedItems.filter(
                (item: SurveyItemDto) => action.payload.includes(item)
            )
        },

        addPendingSubscribes: (
            state: SurveyItemsState, 
            action: PayloadAction<SurveyItemDto[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItemDto) => state.pendingChanges.toSubscribeItems.includes(item)
            )
            state.pendingChanges.toSubscribeItems.concat(notReplicatedData);
        },

        addPendingUnsubscribes: (
            state: SurveyItemsState, 
            action: PayloadAction<SurveyItemDto[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItemDto) => state.pendingChanges.toUnsubscribeItems.includes(item)
            )
            state.pendingChanges.toUnsubscribeItems.concat(notReplicatedData);
        },

        addPendingRemoves: (
            state: SurveyItemsState, 
            action: PayloadAction<SurveyItemDto[]>
        ) => {
            const notReplicatedData = action.payload.filter(
                (item: SurveyItemDto) => state.pendingChanges.toRemoveItems.includes(item)
            )
            state.pendingChanges.toRemoveItems.concat(notReplicatedData);
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