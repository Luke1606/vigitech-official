// userItemLists.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from 'crypto';
import type { UserItemList, SurveyItem } from '../../../domain';

// Definir y exportar los tipos de pending changes
export interface PendingChangeBase {
    error?: {
        message: string;
        timestamp: number;
        code: string;
    };
    retryCount: number;
}

export interface PendingCreateList extends PendingChangeBase {
    listName: string;
}

export interface PendingUpdateList extends PendingChangeBase {
    listId: UUID;
    listNewName: string;
}

export interface PendingRemoveList extends PendingChangeBase {
    listId: UUID;
}

export interface PendingAppendAllItems extends PendingChangeBase {
    listId: UUID;
    items: SurveyItem[];
}

export interface PendingRemoveAllItems extends PendingChangeBase {
    listId: UUID;
    itemIds: UUID[];
}

export type PendingChanges = {
    toCreateList: PendingCreateList[];
    toUpdateList: PendingUpdateList[];
    toRemoveList: PendingRemoveList[];
    toAppendAllItems: PendingAppendAllItems[];
    toRemoveAllItems: PendingRemoveAllItems[];
};

type UserItemListsState = {
    lists: UserItemList[];
    pendingChanges: PendingChanges;
    synchronized: boolean;
};

const initialState: UserItemListsState = {
    lists: [],
    pendingChanges: {
        toCreateList: [],
        toUpdateList: [],
        toRemoveList: [],
        toAppendAllItems: [],
        toRemoveAllItems: [],
    },
    synchronized: true,
};

const findPendingChangeIndex = (pendingChanges: PendingChanges, failure: any): number => {
    const { type } = failure;

    switch (type) {
        case 'toCreateList':
            return pendingChanges.toCreateList.findIndex(item => item.listName === failure.listName);
        case 'toUpdateList':
            return pendingChanges.toUpdateList.findIndex(item => item.listId === failure.listId);
        case 'toRemoveList':
            return pendingChanges.toRemoveList.findIndex(item => item.listId === failure.listId);
        case 'toAppendAllItems':
            return pendingChanges.toAppendAllItems.findIndex(item =>
                item.listId === failure.listId &&
                JSON.stringify(item.items) === JSON.stringify(failure.items)
            );
        case 'toRemoveAllItems':
            return pendingChanges.toRemoveAllItems.findIndex(item =>
                item.listId === failure.listId &&
                JSON.stringify(item.itemIds) === JSON.stringify(failure.itemIds)
            );
        default:
            return -1;
    }
};

// Helper para actualizar pending changes con tipos seguros
const updatePendingChange = (state: UserItemListsState, failure: any): void => {
    const { type } = failure;

    switch (type) {
        case 'toCreateList': {
            const index = state.pendingChanges.toCreateList.findIndex(
                item => item.listName === failure.listName
            );
            if (index !== -1) {
                Object.assign(state.pendingChanges.toCreateList[index], failure);
            }
            break;
        }
        case 'toUpdateList': {
            const index = state.pendingChanges.toUpdateList.findIndex(
                item => item.listId === failure.listId
            );
            if (index !== -1) {
                Object.assign(state.pendingChanges.toUpdateList[index], failure);
            }
            break;
        }
        case 'toRemoveList': {
            const index = state.pendingChanges.toRemoveList.findIndex(
                item => item.listId === failure.listId
            );
            if (index !== -1) {
                Object.assign(state.pendingChanges.toRemoveList[index], failure);
            }
            break;
        }
        case 'toAppendAllItems': {
            const index = state.pendingChanges.toAppendAllItems.findIndex(
                item => item.listId === failure.listId &&
                    JSON.stringify(item.items) === JSON.stringify(failure.items)
            );
            if (index !== -1) {
                Object.assign(state.pendingChanges.toAppendAllItems[index], failure);
            }
            break;
        }
        case 'toRemoveAllItems': {
            const index = state.pendingChanges.toRemoveAllItems.findIndex(
                item => item.listId === failure.listId &&
                    JSON.stringify(item.itemIds) === JSON.stringify(failure.itemIds)
            );
            if (index !== -1) {
                Object.assign(state.pendingChanges.toRemoveAllItems[index], failure);
            }
            break;
        }
        default:
            break;
    }
};

const userItemListsSlice = createSlice({
    name: 'userItemLists',
    initialState,
    reducers: {
        // Reducers para actualizaciones optimistas (estado UI)
        addPendingCreateList: (state, action: PayloadAction<UserItemList>) => {
            state.lists.push(action.payload);
            state.synchronized = false;
        },
        addPendingUpdateList: (state, action: PayloadAction<{ listId: UUID; listNewName: string }>) => {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                list.name = action.payload.listNewName;
                list.updatedAt = new Date().toISOString();
            }
            state.synchronized = false;
        },
        addPendingRemoveList: (state, action: PayloadAction<UUID>) => {
            state.lists = state.lists.filter(list => list.id !== action.payload);
            state.synchronized = false;
        },
        addPendingAppendAllItems: (state, action: PayloadAction<{ listId: UUID; items: SurveyItem[] }>) => {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                list.items.push(...action.payload.items);
                list.updatedAt = new Date().toISOString();
            }
            state.synchronized = false;
        },
        addPendingRemoveAllItems: (state, action: PayloadAction<{ listId: UUID; itemIds: UUID[] }>) => {
            const list = state.lists.find(l => l.id === action.payload.listId);
            if (list) {
                list.items = list.items.filter(item => !action.payload.itemIds.includes(item.id));
                list.updatedAt = new Date().toISOString();
            }
            state.synchronized = false;
        },

        // Reducers para agregar a pendingChanges (operaciones fallidas)
        addPendingCreateListWithError: (state, action: PayloadAction<PendingCreateList>) => {
            state.pendingChanges.toCreateList.push(action.payload);
            state.synchronized = false;
        },
        addPendingUpdateListWithError: (state, action: PayloadAction<PendingUpdateList>) => {
            state.pendingChanges.toUpdateList.push(action.payload);
            state.synchronized = false;
        },
        addPendingRemoveListWithError: (state, action: PayloadAction<PendingRemoveList>) => {
            state.pendingChanges.toRemoveList.push(action.payload);
            state.synchronized = false;
        },
        addPendingAppendAllItemsWithError: (state, action: PayloadAction<PendingAppendAllItems>) => {
            state.pendingChanges.toAppendAllItems.push(action.payload);
            state.synchronized = false;
        },
        addPendingRemoveAllItemsWithError: (state, action: PayloadAction<PendingRemoveAllItems>) => {
            state.pendingChanges.toRemoveAllItems.push(action.payload);
            state.synchronized = false;
        },

        // Reducer para establecer las listas reales (después de sincronizar con servidor)
        setRealList: (state, action: PayloadAction<UserItemList[]>) => {
            state.lists = action.payload;
            // Actualizar synchronized basado en pendingChanges
            state.synchronized =
                state.pendingChanges.toCreateList.length === 0 &&
                state.pendingChanges.toUpdateList.length === 0 &&
                state.pendingChanges.toRemoveList.length === 0 &&
                state.pendingChanges.toAppendAllItems.length === 0 &&
                state.pendingChanges.toRemoveAllItems.length === 0;
        },

        // Reducer para limpiar pending changes
        clearListPendingChanges: (state) => {
            state.pendingChanges = {
                toCreateList: [],
                toUpdateList: [],
                toRemoveList: [],
                toAppendAllItems: [],
                toRemoveAllItems: [],
            };
            state.synchronized = true;
        },

        // Reducer para actualizar pending changes después de reintentos
        updatePendingChangesAfterRetry: (state, action: PayloadAction<{
            successes: Array<{
                type: keyof PendingChanges;
                listName?: string;
                listId?: UUID;
                items?: SurveyItem[];
                itemIds?: UUID[];
            }>;
            failures: Array<{
                type: keyof PendingChanges;
                listName?: string;
                listId?: UUID;
                items?: SurveyItem[];
                itemIds?: UUID[];
                error: any;
                retryCount: number;
                [key: string]: any;
            }>;
        }>) => {
            const { successes, failures } = action.payload;

            // Remover éxitos
            successes.forEach(success => {
                switch (success.type) {
                    case 'toCreateList':
                        state.pendingChanges.toCreateList = state.pendingChanges.toCreateList.filter(
                            item => item.listName !== success.listName
                        );
                        break;
                    case 'toUpdateList':
                        state.pendingChanges.toUpdateList = state.pendingChanges.toUpdateList.filter(
                            item => item.listId !== success.listId
                        );
                        break;
                    case 'toRemoveList':
                        state.pendingChanges.toRemoveList = state.pendingChanges.toRemoveList.filter(
                            item => item.listId !== success.listId
                        );
                        break;
                    case 'toAppendAllItems':
                        state.pendingChanges.toAppendAllItems = state.pendingChanges.toAppendAllItems.filter(
                            item => item.listId !== success.listId
                        );
                        break;
                    case 'toRemoveAllItems':
                        state.pendingChanges.toRemoveAllItems = state.pendingChanges.toRemoveAllItems.filter(
                            item => item.listId !== success.listId
                        );
                        break;
                }
            });

            // Actualizar fallos usando el helper type-safe
            failures.forEach(failure => {
                updatePendingChange(state, failure);
            });

            // Actualizar synchronized
            state.synchronized =
                state.pendingChanges.toCreateList.length === 0 &&
                state.pendingChanges.toUpdateList.length === 0 &&
                state.pendingChanges.toRemoveList.length === 0 &&
                state.pendingChanges.toAppendAllItems.length === 0 &&
                state.pendingChanges.toRemoveAllItems.length === 0;
        },

        // Reducer para limpiar pending changes antiguos
        // En userItemLists.slice.ts
        // En userItemLists.slice.ts
        cleanupOldPendingChanges: (state, action: PayloadAction<{
            maxAge: number; // Solo edad máxima, sin límite de reintentos
        }>) => {
            const { maxAge } = action.payload;

            const shouldRemove = (change: any) => {
                // SOLO eliminar por edad extremadamente antigua
                // NO hay verificación de retryCount
                if (change.error?.timestamp && change.error.timestamp < maxAge) {
                    return true;
                }
                return false;
            };

            // Aplicar el filtro a todos los arrays
            state.pendingChanges.toCreateList = state.pendingChanges.toCreateList.filter(
                change => !shouldRemove(change)
            );
            state.pendingChanges.toUpdateList = state.pendingChanges.toUpdateList.filter(
                change => !shouldRemove(change)
            );
            state.pendingChanges.toRemoveList = state.pendingChanges.toRemoveList.filter(
                change => !shouldRemove(change)
            );
            state.pendingChanges.toAppendAllItems = state.pendingChanges.toAppendAllItems.filter(
                change => !shouldRemove(change)
            );
            state.pendingChanges.toRemoveAllItems = state.pendingChanges.toRemoveAllItems.filter(
                change => !shouldRemove(change)
            );

            // Actualizar synchronized
            state.synchronized =
                state.pendingChanges.toCreateList.length === 0 &&
                state.pendingChanges.toUpdateList.length === 0 &&
                state.pendingChanges.toRemoveList.length === 0 &&
                state.pendingChanges.toAppendAllItems.length === 0 &&
                state.pendingChanges.toRemoveAllItems.length === 0;
        }
    }
},
);

export const {
    addPendingCreateList,
    addPendingUpdateList,
    addPendingRemoveList,
    addPendingAppendAllItems,
    addPendingRemoveAllItems,
    addPendingCreateListWithError,
    addPendingUpdateListWithError,
    addPendingRemoveListWithError,
    addPendingAppendAllItemsWithError,
    addPendingRemoveAllItemsWithError,
    setRealList,
    clearListPendingChanges,
    updatePendingChangesAfterRetry,
    cleanupOldPendingChanges,
} = userItemListsSlice.actions;

export const userItemListsReducer = userItemListsSlice.reducer;