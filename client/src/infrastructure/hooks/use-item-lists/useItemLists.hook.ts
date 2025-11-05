// useUserItemLists.hook.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'crypto';
import type { UserItemList, SurveyItem } from '../../';
import type { RootState, AppDispatch } from '../../';
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';
import {
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
} from '../../redux/reducers/item-lists/slice';
import type { PendingChanges } from '../../redux/reducers/item-lists/slice';

// Helper para obtener código de error
const getErrorCode = (error: any): string => {
    return error?.code || error?.response?.status?.toString() || 'UNKNOWN_ERROR';
};

// Tipo para los resultados de reintento
type RetryResult = {
    successes: Array<{
        type: keyof PendingChanges;
        listName?: string;
        listId?: UUID;
        items?: SurveyItem[];
        itemIds?: UUID[];
        [key: string]: any;
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
};

// Tipo para las funciones de mutación que devuelven Promise
type MutationFunction<TArgs, TReturn> = (args: TArgs) => Promise<TReturn>;

export const useUserItemLists = () => {
    const dispatch = useDispatch<AppDispatch>();
    const lists = useSelector((state: RootState) => state.userItemLists.lists);
    const pendingChanges = useSelector((state: RootState) => state.userItemLists.pendingChanges);
    const synchronized = useSelector((state: RootState) => state.userItemLists.synchronized);

    const query = useUserItemListsAPI();

    // Sincronizar Redux con los datos de React Query
    useEffect(() => {
        if (query.findAll.data) {
            dispatch(setRealList(query.findAll.data));
        }
    }, [query.findAll.data, dispatch]);

    // Efecto para limpiar pending changes antiguos al cargar la aplicación
    useEffect(() => {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

        const shouldRemove = (change: any) => {
            if (change.error?.timestamp && change.error.timestamp < oneWeekAgo) {
                return true;
            }
            if (change.retryCount >= 5) {
                return true;
            }
            return false;
        };

        dispatch(cleanupOldPendingChanges({ shouldRemove }));
    }, [dispatch]);

    // Función para ejecutar operaciones con manejo de errores
    const executeOperation = async <T>(
        optimisticAction: any,
        mutationFn: MutationFunction<T, any>,
        mutationArgs: T,
        operationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPEND_ITEMS' | 'REMOVE_ITEMS',
        operationData: any
    ) => {
        // 1. Dispatch optimista para UI
        dispatch(optimisticAction);

        try {
            // 2. Intentar petición al servidor
            await mutationFn(mutationArgs);
            // 3. Éxito - no hacer nada más, setRealList se encargará

        } catch (error) {
            // 4. Error - agregar a pendingChanges manteniendo el cambio optimista
            const pendingChange = {
                ...operationData,
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: Date.now(),
                    code: getErrorCode(error)
                },
                retryCount: 0
            };

            // Dispatch específico para cada tipo de pending change
            switch (operationType) {
                case 'CREATE':
                    dispatch(addPendingCreateListWithError(pendingChange));
                    break;
                case 'UPDATE':
                    dispatch(addPendingUpdateListWithError(pendingChange));
                    break;
                case 'DELETE':
                    dispatch(addPendingRemoveListWithError(pendingChange));
                    break;
                case 'APPEND_ITEMS':
                    dispatch(addPendingAppendAllItemsWithError(pendingChange));
                    break;
                case 'REMOVE_ITEMS':
                    dispatch(addPendingRemoveAllItemsWithError(pendingChange));
                    break;
            }

            throw error;
        }
    };

    // Función para reintentar pending changes
    const retryPendingChanges = async (options?: {
        maxRetries?: number;
    }): Promise<RetryResult> => {
        const maxRetries = options?.maxRetries || 3;
        const results: RetryResult = {
            successes: [],
            failures: []
        };

        // Helper para reintentar un cambio individual
        const retryChange = async (change: any, type: keyof PendingChanges): Promise<boolean> => {
            if (change.retryCount >= maxRetries) {
                results.failures.push({
                    ...change,
                    type,
                    error: { ...change.error, message: 'Max retries exceeded' }
                });
                return false;
            }

            try {
                switch (type) {
                    case 'toCreateList':
                        await query.createList(change.listName);
                        results.successes.push({
                            type: 'toCreateList',
                            listName: change.listName
                        });
                        break;
                    case 'toUpdateList':
                        // CORREGIDO: Pasar objeto en lugar de parámetros separados
                        if (query.updateList) {
                            await query.updateList({
                                listId: change.listId,
                                listNewName: change.listNewName
                            });
                            results.successes.push({
                                type: 'toUpdateList',
                                listId: change.listId
                            });
                        }
                        break;
                    case 'toRemoveList':
                        await query.deleteList(change.listId);
                        results.successes.push({
                            type: 'toRemoveList',
                            listId: change.listId
                        });
                        break;
                    case 'toAppendAllItems':
                        // CORREGIDO: Pasar objeto en lugar de parámetros separados
                        await query.appendAllItem({
                            listId: change.listId,
                            itemIds: change.items.map((item: SurveyItem) => item.id)
                        });
                        results.successes.push({
                            type: 'toAppendAllItems',
                            listId: change.listId
                        });
                        break;
                    case 'toRemoveAllItems':
                        // CORREGIDO: Pasar objeto en lugar de parámetros separados
                        await query.removeAllItem({
                            listId: change.listId,
                            itemIds: change.itemIds
                        });
                        results.successes.push({
                            type: 'toRemoveAllItems',
                            listId: change.listId
                        });
                        break;
                }
                return true;
            } catch (error) {
                results.failures.push({
                    ...change,
                    type,
                    error: {
                        message: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: Date.now()
                    },
                    retryCount: change.retryCount + 1
                });
                return false;
            }
        };

        // Reintentar por cada tipo
        const types: (keyof PendingChanges)[] = [
            'toCreateList', 'toUpdateList', 'toRemoveList',
            'toAppendAllItems', 'toRemoveAllItems'
        ];

        for (const type of types) {
            const changes = [...pendingChanges[type]];
            for (const change of changes) {
                await retryChange(change, type);
            }
        }

        // Actualizar el estado de pendingChanges después del reintento
        dispatch(updatePendingChangesAfterRetry(results));

        return results;
    };

    // Función para limpiar pending changes antiguos
    const cleanupPendingChanges = () => {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

        const shouldRemove = (change: any) => {
            if (change.error?.timestamp && change.error.timestamp < oneWeekAgo) {
                return true;
            }
            if (change.retryCount >= 5) {
                return true;
            }
            return false;
        };

        dispatch(cleanupOldPendingChanges({ shouldRemove }));
    };

    return {
        query,
        lists,
        pendingChanges,
        synchronized,

        // Operaciones principales - CORREGIDAS
        createList: (listName: string) => {
            const tempId = crypto.randomUUID() as UUID;
            const tempList: UserItemList = {
                id: tempId,
                name: listName,
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            return executeOperation(
                addPendingCreateList(tempList),
                query.createList,
                listName,
                'CREATE',
                { listName }
            );
        },

        updateList: (listId: UUID, listNewName: string) => {
            // Verificar si updateList existe antes de usarlo
            if (!query.updateList) {
                throw new Error('updateList mutation not implemented');
            }

            // CORREGIDO: Pasar objeto en lugar de parámetros separados
            return executeOperation(
                addPendingUpdateList({ listId, listNewName }),
                query.updateList,
                { listId, listNewName }, // Ahora es un objeto
                'UPDATE',
                { listId, listNewName }
            );
        },

        removeList: (listId: UUID) =>
            executeOperation(
                addPendingRemoveList(listId),
                query.deleteList,
                listId, // deleteList espera un UUID directamente, no un objeto
                'DELETE',
                { listId }
            ),

        appendAllItems: (listId: UUID, items: SurveyItem[]) =>
            // CORREGIDO: Pasar objeto en lugar de parámetros separados
            executeOperation(
                addPendingAppendAllItems({ listId, items }),
                query.appendAllItem,
                { listId, itemIds: items.map(item => item.id) }, // Ahora es un objeto
                'APPEND_ITEMS',
                { listId, items }
            ),

        removeAllItems: (listId: UUID, itemIds: UUID[]) =>
            // CORREGIDO: Pasar objeto en lugar de parámetros separados
            executeOperation(
                addPendingRemoveAllItems({ listId, itemIds }),
                query.removeAllItem,
                { listId, itemIds }, // Ahora es un objeto
                'REMOVE_ITEMS',
                { listId, itemIds }
            ),

        // Funciones de gestión de pending changes
        retryPendingChanges,
        cleanupPendingChanges,

        // Funciones auxiliares de Redux
        setRealList: (lists: UserItemList[]) => dispatch(setRealList(lists)),
        clearListPendingChanges: () => dispatch(clearListPendingChanges())
    };
};