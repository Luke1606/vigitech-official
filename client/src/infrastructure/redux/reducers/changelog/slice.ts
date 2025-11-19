import type { ChangeLogEntry } from "../../../domain";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChangelogState {
    changelogs: ChangeLogEntry[];
}

const initialState: ChangelogState = {
    changelogs: [],
};


export const changelogSlice = createSlice({
    name: 'changeLog',
    initialState,
    reducers: {
        addChangeLog: (
            state: ChangelogState,
            action: PayloadAction<ChangeLogEntry>
        ) => {
            state.changelogs.push(action.payload)
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
