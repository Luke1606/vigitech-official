import type { UUID } from "crypto";
import type { UserItemList, SurveyItem } from "@/infrastructure";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PendingItemChanges = {
    listId: string;
    items: UUID[]
}
export interface ItemListState {
    lists: UserItemList[];
    pendingChanges: {
        toDeleteLists: UserItemList[];
        toCreateLists: UserItemList[];
        toUpdateLists: UserItemList[];
        toAppendItems: PendingItemChanges[];
        toRemoveItems: PendingItemChanges[];
    }
}

const initialState: ItemListState = {
    lists: [],
    pendingChanges: {
        toDeleteLists: [],
        toCreateLists: [],
        toUpdateLists: [],
        toAppendItems: [],
        toRemoveItems: [],
    }
};

const itemListSlice = createSlice({
    name: 'itemLists',
    initialState,
    reducers: {
        addPendingCreateList(
            state: ItemListState,
            action: PayloadAction<UserItemList>
        ) {
            state.lists.push(action.payload);
            state.pendingChanges.toCreateLists.push(action.payload);
        },

        addPendingUpdateList(state, action: PayloadAction<{ listId: string; listNewName: string }>) {
            state.lists.forEach(
                (list: UserItemList) => {
                    if (list.id === action.payload.listId)
                        list.name = action.payload.listNewName;
                }

            );

            // const toAppendChangeList = state.pendingChanges.toCreateLists.find(
            //     (list: UserItemList) => list.id === action.payload.listId
            // );

            // if (toAppendChangeList)
            //     state.pendingChanges.toUpdateLists.push({
            //         id: action.payload.listId,
            //         name: action.payload.listNewName,
            //         items: toUpdatelist.items
            //     });

        },

        addPendingRemoveList(state, action: PayloadAction<string>) {
            const list = state.lists.find(l => l.id === action.payload);
            if (list) {
                state.pendingChanges.toDeleteLists.push(list);
                state.lists = state.lists.filter(l => l.id !== action.payload);
            }
        },

        addPendingAppendAllItems(state, action: PayloadAction<{ listId: string; items: SurveyItem[] }>) {
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
                    const existing = state.pendingChanges.toAppendItems.find(
                        (pendingItemChanges: PendingItemChanges) =>
                            pendingItemChanges.listId === action.payload.listId
                    );

                    if (existing) {
                        existing.items.push(...newIds.filter(id => !existing.items.includes(id)));
                    } else {
                        state.pendingChanges.toAppendItems.push({
                            listId: action.payload.listId,
                            items: newIds,
                        });
                    }
                }
            }
        },

        addPendingRemoveAllItems(state, action: PayloadAction<{ listId: string; itemIds: UUID[] }>) {
            state.lists.forEach(
                (list: UserItemList) => {
                    if (list.id === action.payload.listId) {
                        list.items = list.items.filter(
                            (item: SurveyItem) =>
                                !action.payload.itemIds.includes(item.id)
                        );

                        const existing = state.pendingChanges.toRemoveItems.find(
                            (toRemoveItemList) =>
                                toRemoveItemList.listId === action.payload.listId
                        );

                        if (existing) {
                            existing.items.push(
                                ...action.payload.itemIds.filter(id => !existing.items.includes(id))
                            );
                        } else {
                            state.pendingChanges.toRemoveItems.push({
                                listId: action.payload.listId,
                                items: [...action.payload.itemIds],
                            });
                        }
                    }
                }
            );
        },

        clearListPendingChanges(state) {
            state.pendingChanges = {
                toCreateLists: [],
                toUpdateLists: [],
                toDeleteLists: [],
                toAppendItems: [],
                toRemoveItems: [],
            };
        },
    },
});

export const {
    addPendingCreateList,
    addPendingUpdateList,
    addPendingRemoveList,
    addPendingAppendAllItems,
    addPendingRemoveAllItems,
    clearListPendingChanges
} = itemListSlice.actions;

export const itemListReducer = itemListSlice.reducer;
