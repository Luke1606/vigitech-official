import type { UserItemList } from "@/infrastructure/domain";
import { createSlice } from "@reduxjs/toolkit";
import type { UUID } from "crypto";

export interface ItemListState {
    lists: UserItemList[];
    pendingChanges: {
        toDeleteLists: UserItemList[];
        toCreateLists: UserItemList[];
        toAppendItems: {
            listId: UUID;
            newItems: UUID[]
        }[];
        toRemoveItems: {
            listId: UUID;
            newItems: UUID[]
        }[];
    }
}

const initialState: ItemListState = {
    lists: [],
    pendingChanges: {
        toDeleteLists: [],
        toCreateLists: [],
        toAppendItems: [],
        toRemoveItems: [],
    }
};

const itemListSlice = createSlice({
    name: 'itemLists',
    initialState,
    reducers: {

    }
    
});

export const itemListReducer = itemListSlice.reducer;
