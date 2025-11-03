import type { UUID } from "crypto";
import type { UserItemList, SurveyItem } from "../../..";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PendingItemChanges = {
    listId: UUID;
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
    },
    synchronized: boolean
}

const initialState: ItemListState = {
    lists: [],
    pendingChanges: {
        toDeleteLists: [],
        toCreateLists: [],
        toUpdateLists: [],
        toAppendItems: [],
        toRemoveItems: [],
    },
    synchronized: false,
};

const itemListSlice = createSlice({
    name: 'userItemLists',
    initialState,
    reducers: {
        addPendingCreateList(
            state: ItemListState,
            action: PayloadAction<UserItemList>
        ) {
            const existList = state.lists.find(l => l.name === action.payload.name)
            if (!existList) state.lists.push(action.payload);
            else alert(`La lista ${existList.name} ya existe`)

            const isPendingList = state.pendingChanges.toCreateLists.find(l => l.name === action.payload.name)
            if (!isPendingList) {
                state.pendingChanges.toCreateLists.push(action.payload);
                state.synchronized = false;
            }
        },

        addPendingUpdateList(state, action: PayloadAction<{ listId: UUID; listNewName: string }>) {

            const existListName = state.lists.find(l => l.name === action.payload.listNewName);
            const listIndex = state.lists.findIndex(l => l.id === action.payload.listId);

            if (existListName?.id === state.lists[listIndex].id) {
                alert(`La lista ya tiene el nombre ${action.payload.listNewName}.`);
                return;
            }
            else if (existListName) {
                alert(`Ya existe una lista nombre ${action.payload.listNewName}.`);
                return;
            }

            if (listIndex !== -1) state.lists[listIndex].name = action.payload.listNewName;

            const pendingList = state.pendingChanges.toUpdateLists.find(l => l.id === action.payload.listId)

            if (pendingList) {
                const pendingListIndex = state.pendingChanges.toUpdateLists.findIndex(l => l.id === action.payload.listId)
                state.pendingChanges.toUpdateLists[pendingListIndex].name = action.payload.listNewName;
            }
            state.pendingChanges.toUpdateLists.push({ id: action.payload.listId, name: action.payload.listNewName, items: [] })
            state.synchronized = false;
        },

        addPendingRemoveList(
            state,
            action: PayloadAction<UUID>
        ) {
            const list = state.lists.find(l => l.id === action.payload);
            if (list) {
                state.pendingChanges.toDeleteLists.push(list);
                state.lists = state.lists.filter(l => l.id !== action.payload);
                state.synchronized = false;
            }
        },

        addPendingAppendAllItems(state, action: PayloadAction<{ listId: UUID; items: SurveyItem[] }>) {
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

        clearListPendingChanges(state: ItemListState) {
            state.pendingChanges = { ...initialState.pendingChanges };
            state.synchronized = true;
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

export const userItemListsReducer = itemListSlice.reducer;
