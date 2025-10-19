import type { UserItemList, SurveyItem } from "@/infrastructure";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
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
        upsertList(state, action: PayloadAction<UserItemList & { id: UUID }>) {
            const index = state.lists.findIndex((item: UserItemList) => item.id === action.payload.id);
            if (index >= 0) {
                state.lists[index] = action.payload;
            } else {
                state.lists.push(action.payload);
            }
        },

        createList(state, action: PayloadAction<UserItemList & { id: UUID }>) {
            state.lists.push(action.payload);
            state.pendingChanges.toCreateLists.push(action.payload);
        },

        updateList(state, action: PayloadAction<{ listId: UUID; listName: string }>) {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) list.name = action.payload.listName;
        },

        removeList(state, action: PayloadAction<UUID>) {
            const list = state.lists.find(l => l.id === action.payload);
            if (list) {
                state.pendingChanges.toDeleteLists.push(list);
                state.lists = state.lists.filter(l => l.id !== action.payload);
            }
        },

        appendOneItem(state, action: PayloadAction<{ listId: UUID; item: SurveyItem }>) {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list && !list.items.some(i => i.id === action.payload.item.id)) {
                list.items.push(action.payload.item);

                const existing = state.pendingChanges.toAppendItems.find(p => p.listId === action.payload.listId);
                if (existing) {
                    if (!existing.newItems.includes(action.payload.item.id)) {
                        existing.newItems.push(action.payload.item.id);
                    }
                } else {
                    state.pendingChanges.toAppendItems.push({
                        listId: action.payload.listId,
                        newItems: [action.payload.item.id],
                    });
                }
            }
        },

        appendAllItems(state, action: PayloadAction<{ listId: UUID; items: SurveyItem[] }>) {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                const newIds: UUID[] = [];

                for (const item of action.payload.items) {
                    if (!list.items.some(i => i.id === item.id)) {
                        list.items.push(item);
                        newIds.push(item.id);
                    }
                }

                if (newIds.length > 0) {
                    const existing = state.pendingChanges.toAppendItems.find(p => p.listId === action.payload.listId);
                    if (existing) {
                        existing.newItems.push(...newIds.filter(id => !existing.newItems.includes(id)));
                    } else {
                        state.pendingChanges.toAppendItems.push({
                            listId: action.payload.listId,
                            newItems: newIds,
                        });
                    }
                }
            }
        },

        removeOneItem(state, action: PayloadAction<{ listId: UUID; itemId: UUID }>) {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                list.items = list.items.filter(i => i.id !== action.payload.itemId);

                const existing = state.pendingChanges.toRemoveItems.find(p => p.listId === action.payload.listId);
                if (existing) {
                    if (!existing.newItems.includes(action.payload.itemId)) {
                        existing.newItems.push(action.payload.itemId);
                    }
                } else {
                    state.pendingChanges.toRemoveItems.push({
                        listId: action.payload.listId,
                        newItems: [action.payload.itemId],
                    });
                }
            }
        },

        removeAllItems(state, action: PayloadAction<{ listId: UUID; itemIds: UUID[] }>) {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                list.items = list.items.filter(i => !action.payload.itemIds.includes(i.id));

                const existing = state.pendingChanges.toRemoveItems.find(p => p.listId === action.payload.listId);
                if (existing) {
                    existing.newItems.push(...action.payload.itemIds.filter(id => !existing.newItems.includes(id)));
                } else {
                    state.pendingChanges.toRemoveItems.push({
                        listId: action.payload.listId,
                        newItems: [...action.payload.itemIds],
                    });
                }
            }
        },

        clearListPendingChanges(state) {
            state.pendingChanges = {
                toDeleteLists: [],
                toCreateLists: [],
                toAppendItems: [],
                toRemoveItems: [],
            };
        },
    },
});

export const {
    upsertList,
    createList,
    updateList,
    removeList,
    appendOneItem,
    appendAllItems,
    removeOneItem,
    removeAllItems,
    clearListPendingChanges
} = itemListSlice.actions;

export const itemListReducer = itemListSlice.reducer;
