import type { ChangeLogEntry } from "@/infrastructure/domain";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChangelogState {
    changelogs: string[];
}

const initialState: ChangelogState = {
    changelogs: [],
};


export const changelogSlice = createSlice({
    name: 'surveyItems',
    initialState,
    reducers: {
        addChangeLog: (
            state: ChangelogState,
            action: PayloadAction<ChangeLogEntry>
        ) => {
            const { itemTitle, oldRing, newRing } = action.payload;
            state.changelogs.push(
                `Item ${itemTitle} has been moved from ${oldRing} to ${newRing}`
            )
        },

        clearChangeLog: (state: ChangelogState) => {
            state.changelogs = [];
        },
    }
})

export const {
    addChangeLog,
    clearChangeLog
} = changelogSlice.actions;

export const changelogReducer = changelogSlice.reducer;
