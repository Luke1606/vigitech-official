import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SurveyItemDto } from '@/infrastructure';

interface SurveyItemsState {
    selectedItem: SurveyItemDto | null;
    pendingChanges: {
        toRemoveItems: SurveyItemDto[];
        toSubscribeItems: SurveyItemDto[];
        toUnsubscribeItems: SurveyItemDto[];
    }
}

const initialState: SurveyItemsState = {
    selectedItem: null,
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
        setSelectedItem: (
            state, action: PayloadAction<SurveyItemDto | null>
        ) => {
            state.selectedItem = action.payload;
        },

        addPendingSubscribe: (
            state, action: PayloadAction<SurveyItemDto>
        ) => {
            if (!state.pendingChanges.toSubscribeItems.includes(action.payload))
                state.pendingChanges.toSubscribeItems.push(action.payload);
        },

        addPendingUnsubscribe: (
            state, action: PayloadAction<SurveyItemDto>
        ) => {
            if (!state.pendingChanges.toUnsubscribeItems.includes(action.payload))
                state.pendingChanges.toUnsubscribeItems.push(action.payload);
        },

        addPendingRemove: (
            state, action: PayloadAction<SurveyItemDto>
        ) => {
            if (!state.pendingChanges.toRemoveItems.includes(action.payload))
                state.pendingChanges.toRemoveItems.push(action.payload);
        },

        clearPendingChanges: (state) => {
            state.pendingChanges = {
                toSubscribeItems: [],
                toRemoveItems: [],
                toUnsubscribeItems: []
            };
        },

        applyAllChanges: (state) => {
            state.pendingChanges.toRemoveItems.forEach(
                (item) => console.log(item)
            )
        },
    },
});

export const { 
    setSelectedItem, 
    addPendingSubscribe, 
    addPendingRemove, 
    clearPendingChanges,
    applyAllChanges
} = surveyItemsSlice.actions;
export const surveyItemsReducer = surveyItemsSlice.reducer;