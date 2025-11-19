// useUpdateListMutationOptions.test.ts
// ===== MOCKS GLOBALES - CORREGIDOS =====

// Mock para @tanstack/react-query - CORREGIDO
jest.mock('@tanstack/react-query', () => ({
    QueryClient: jest.fn().mockImplementation(() => ({
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
        clear: jest.fn(),
    })),
    useQueryClient: jest.fn(),
    mutationOptions: jest.fn((options) => options),
}));

// Mock para Redux y Redux-persist
jest.mock('../../../../redux/store', () => ({
    store: {
        getState: jest.fn(() => ({
            userItemLists: [],
            surveyItems: [],
            changeLog: []
        })),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        replaceReducer: jest.fn(),
    },
    persistor: {
        persist: jest.fn(),
        purge: jest.fn(),
        flush: jest.fn(),
    },
}));

jest.mock('redux-persist', () => {
    const actual = jest.requireActual('redux-persist');
    return {
        ...actual,
        persistReducer: jest.fn((reducer) => reducer),
        persistStore: jest.fn(),
        FLUSH: 'FLUSH',
        REHYDRATE: 'REHYDRATE',
        PAUSE: 'PAUSE',
        PERSIST: 'PERSIST',
        PURGE: 'PURGE',
        REGISTER: 'REGISTER',
    };
});

jest.mock('redux-persist/lib/storage', () => ({
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

jest.mock('@reduxjs/toolkit', () => {
    const actual = jest.requireActual('@reduxjs/toolkit');
    return {
        ...actual,
        configureStore: jest.fn(),
        combineReducers: jest.fn(),
    };
});

// Mock para configuración de entorno
jest.mock('../../../../config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:3000',
        VITE_NOVU_APPLICATION_ID: 'test-novu-app-id',
        VITE_NOVU_SECRET_KEY: 'test-novu-secret-key',
        VITE_CLERK_PUBLISHABLE_KEY: 'test-clerk-key'
    }))
}));

// Mock para Axios y repositorios
jest.mock('../../../../utils/AxiosConfiguredInstance.util', () => ({
    AxiosConfiguredInstance: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn()
    }))
}));

jest.mock('../../../../domain/repositories/user-item-list/UserItemList.repository', () => ({
    userItemListRepository: {
        updateList: jest.fn()
    }
}));

// Mock para react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
    },
}));

jest.mock('../constants', () => ({
    userItemListsKey: 'userItemLists',
}));

// ===== IMPORTS =====
import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userItemListRepository } from '../../../../';
import { useUpdateListMutationOptions } from './updateList.mutation';
import { userItemListsKey } from '../constants';
import type { UserItemList, SurveyItem, UUID } from '../../../../';

// ===== TIPOS Y MOCKS =====
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;
const mockUserItemListRepository = userItemListRepository as jest.Mocked<typeof userItemListRepository>;

// Helper para crear mock de UserItemList
const createMockUserItemList = (overrides?: Partial<UserItemList>): UserItemList => ({
    id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
    name: 'Test List',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    items: [] as SurveyItem[],
    ...overrides,
});

// Datos de prueba
const mockLists: UserItemList[] = [
    createMockUserItemList({
        id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
        name: 'Lista 1'
    }),
    createMockUserItemList({
        id: '123e4567-e89b-12d3-a456-426614174001' as UUID,
        name: 'Lista 2'
    })
];

const mockUpdatedList: UserItemList = createMockUserItemList({
    id: '123e4567-e89b-12d3-a456-426614174000' as UUID,
    name: 'Lista Actualizada',
    updatedAt: '2023-01-02T00:00:00.000Z'
});

// ===== CONFIGURACIÓN DE PRUEBAS =====
describe('useUpdateListMutationOptions', () => {
    let queryClient: jest.Mocked<any>;

    beforeEach(() => {
        // Mock de QueryClient - CORREGIDO
        queryClient = {
            cancelQueries: jest.fn().mockResolvedValue(undefined),
            getQueryData: jest.fn(),
            setQueryData: jest.fn(),
            invalidateQueries: jest.fn(),
            clear: jest.fn(),
        };

        mockUseQueryClient.mockReturnValue(queryClient);
        mockUserItemListRepository.updateList.mockResolvedValue(mockUpdatedList);

        // Limpiar todos los mocks
        jest.clearAllMocks();
    });

    // ===== CASOS DE PRUEBA =====

    describe('mutationFn', () => {
        it('should call repository with correct parameters', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre de prueba';

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.mutationFn) {
                const result = await options.mutationFn({ listId, listNewName });

                // Assert
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledWith(listId, listNewName);
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledTimes(1);
                expect(result).toEqual(mockUpdatedList);
            } else {
                fail('mutationFn should be defined');
            }
        });

        it('should handle repository errors', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre de prueba';
            const repositoryError = new Error('Repository error');

            mockUserItemListRepository.updateList.mockRejectedValue(repositoryError);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert
            if (options.mutationFn) {
                await expect(options.mutationFn({ listId, listNewName })).rejects.toThrow('Repository error');
            } else {
                fail('mutationFn should be defined');
            }
        });
    });

    describe('onMutate', () => {
        it('should cancel queries and update cache optimistically when lists exist', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre actualizado';

            queryClient.getQueryData.mockReturnValue(mockLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onMutate) {
                const context = await options.onMutate({ listId, listNewName });

                // Assert
                expect(queryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
                expect(queryClient.getQueryData).toHaveBeenCalledWith([userItemListsKey]);

                expect(queryClient.setQueryData).toHaveBeenCalledWith(
                    [userItemListsKey],
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: listId,
                            name: listNewName,
                            updatedAt: expect.any(String),
                            items: []
                        }),
                        mockLists[1]
                    ])
                );

                expect(context).toEqual({ previousLists: mockLists });
            } else {
                fail('onMutate should be defined');
            }
        });

        it('should return null previousLists when cache is empty', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre actualizado';

            queryClient.getQueryData.mockReturnValue(null);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onMutate) {
                const context = await options.onMutate({ listId, listNewName });

                // Assert - CORREGIDO: ahora espera null en lugar de undefined
                expect(context).toEqual({ previousLists: null });
                expect(queryClient.setQueryData).not.toHaveBeenCalled();
            } else {
                fail('onMutate should be defined');
            }
        });

        it('should not update cache when list to update is not found', async () => {
            // Arrange
            const listId = 'non-existent-id' as UUID;
            const listNewName = 'Nombre actualizado';

            queryClient.getQueryData.mockReturnValue(mockLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onMutate) {
                const context = await options.onMutate({ listId, listNewName });

                // Assert
                expect(queryClient.setQueryData).toHaveBeenCalledWith(
                    [userItemListsKey],
                    mockLists // No changes because list ID doesn't match
                );
                expect(context).toEqual({ previousLists: mockLists });
            } else {
                fail('onMutate should be defined');
            }
        });
    });

    describe('onError', () => {
        it('should revert cache and show error toast when previousLists exist', () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre actualizado';
            const error = new Error('Network error');
            const context = { previousLists: mockLists };

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onError) {
                options.onError(error, { listId, listNewName }, context);

                // Assert
                expect(queryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], mockLists);
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.'
                );
            } else {
                fail('onError should be defined');
            }
        });

        it('should not revert cache but show error toast when previousLists is undefined', () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre actualizado';
            const error = new Error('Network error');
            const context = { previousLists: undefined };

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onError) {
                options.onError(error, { listId, listNewName }, context);

                // Assert
                expect(queryClient.setQueryData).not.toHaveBeenCalled();
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.'
                );
            } else {
                fail('onError should be defined');
            }
        });

        it('should handle different error types', () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre actualizado';
            const error = new Error('Different error message');
            const context = { previousLists: mockLists };

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onError) {
                options.onError(error, { listId, listNewName }, context);

                // Assert
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.'
                );
            } else {
                fail('onError should be defined');
            }
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast on success', () => {
            // Arrange
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;
            const variables = {
                listId: '123e4567-e89b-12d3-a456-426614174000' as UUID,
                listNewName: 'test'
            };
            const context = { previousLists: mockLists };

            // Act
            if (options.onSuccess) {
                options.onSuccess(mockUpdatedList, variables, context);

                // Assert
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
                expect(toast.success).toHaveBeenCalledWith('Se renombró con éxito la lista.');
            } else {
                fail('onSuccess should be defined');
            }
        });

        it('should work with different successful responses', () => {
            // Arrange
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;
            const variables = {
                listId: '123e4567-e89b-12d3-a456-426614174001' as UUID,
                listNewName: 'otro nombre'
            };
            const context = { previousLists: mockLists };
            const differentResponse = createMockUserItemList({
                id: '123e4567-e89b-12d3-a456-426614174001' as UUID,
                name: 'otro nombre',
                updatedAt: '2023-01-03T00:00:00.000Z'
            });

            // Act
            if (options.onSuccess) {
                options.onSuccess(differentResponse, variables, context);

                // Assert
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
                expect(toast.success).toHaveBeenCalledWith('Se renombró con éxito la lista.');
            } else {
                fail('onSuccess should be defined');
            }
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries when settled successfully', () => {
            // Arrange
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;
            const variables = {
                listId: '123e4567-e89b-12d3-a456-426614174000' as UUID,
                listNewName: 'test'
            };
            const context = { previousLists: mockLists };

            // Act
            if (options.onSettled) {
                options.onSettled(mockUpdatedList, null, variables, context);

                // Assert
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            } else {
                fail('onSettled should be defined');
            }
        });

        it('should invalidate queries when settled with error', () => {
            // Arrange
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;
            const variables = {
                listId: '123e4567-e89b-12d3-a456-426614174000' as UUID,
                listNewName: 'test'
            };
            const context = { previousLists: mockLists };
            const error = new Error('Mutation failed');

            // Act
            if (options.onSettled) {
                options.onSettled(undefined, error, variables, context);

                // Assert
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            } else {
                fail('onSettled should be defined');
            }
        });

        it('should always invalidate queries regardless of success or error', () => {
            // Arrange
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;
            const variables = {
                listId: '123e4567-e89b-12d3-a456-426614174000' as UUID,
                listNewName: 'test'
            };
            const context = { previousLists: mockLists };

            // Test successful settlement
            if (options.onSettled) {
                options.onSettled(mockUpdatedList, null, variables, context);
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });

                // Reset mock
                (queryClient.invalidateQueries as jest.Mock).mockClear();

                // Test error settlement
                const error = new Error('Test error');
                options.onSettled(undefined, error, variables, context);
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            } else {
                fail('onSettled should be defined');
            }
        });
    });

    describe('integration scenarios', () => {
        it('should complete full mutation flow successfully', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre integración';

            queryClient.getQueryData.mockReturnValue(mockLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert - Simular flujo completo
            if (options.onMutate && options.mutationFn && options.onSuccess && options.onSettled) {
                // 1. onMutate (optimistic update)
                const context = await options.onMutate({ listId, listNewName });

                // Usar type assertion para asegurar que context no es undefined
                expect(context!.previousLists).toEqual(mockLists);

                // 2. mutationFn (llamada real)
                const mutationResult = await options.mutationFn({ listId, listNewName });
                expect(mutationResult).toEqual(mockUpdatedList);

                // 3. onSuccess
                options.onSuccess(mutationResult, { listId, listNewName }, context!);

                // 4. onSettled
                options.onSettled(mutationResult, null, { listId, listNewName }, context!);

                // Verificar que invalidateQueries se llamó múltiples veces
                expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
            } else {
                fail('All mutation callbacks should be defined');
            }
        });

        it('should handle full error flow correctly', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Nombre error';
            const mutationError = new Error('Mutation failed');

            queryClient.getQueryData.mockReturnValue(mockLists);
            mockUserItemListRepository.updateList.mockRejectedValue(mutationError);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert - Simular flujo de error
            if (options.onMutate && options.onError && options.onSettled) {
                // 1. onMutate (optimistic update)
                const mutationContext = await options.onMutate({ listId, listNewName });

                // 2. Simular error en mutationFn (no lo llamamos directamente)

                // 3. onError
                options.onError(mutationError, { listId, listNewName }, mutationContext!);

                // 4. onSettled
                options.onSettled(undefined, mutationError, { listId, listNewName }, mutationContext!);

                // Verificar que invalidateQueries se llamó
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            } else {
                fail('All mutation callbacks should be defined');
            }
        });
    });

    describe('edge cases', () => {
        it('should handle empty list name - robust version', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = '';

            // Configurar explícitamente getQueryData para devolver mockLists - CORREGIDO: tipo agregado
            queryClient.getQueryData.mockImplementation((key: unknown) => {
                if (JSON.stringify(key) === JSON.stringify([userItemListsKey])) {
                    return mockLists;
                }
                return null;
            });

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert
            if (options.mutationFn && options.onMutate) {
                // Test mutationFn with empty name
                await options.mutationFn({ listId, listNewName });
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledWith(listId, listNewName);

                // Test onMutate with empty name
                await options.onMutate({ listId, listNewName });

                // Verificar que setQueryData fue llamado al menos una vez
                expect(queryClient.setQueryData).toHaveBeenCalled();

                // Verificar específicamente la llamada con userItemListsKey - CORREGIDO: tipo agregado
                const setQueryDataCalls = queryClient.setQueryData.mock.calls;
                const userItemListsCall = setQueryDataCalls.find((call: any[]) =>
                    call[0] && Array.isArray(call[0]) && call[0][0] === userItemListsKey
                );

                expect(userItemListsCall).toBeDefined();

                if (userItemListsCall) {
                    const updatedLists = userItemListsCall[1];
                    expect(Array.isArray(updatedLists)).toBe(true);

                    const updatedList = (updatedLists as UserItemList[]).find(list => list.id === listId);
                    expect(updatedList).toBeDefined();
                    expect(updatedList!.name).toBe('');
                    expect(updatedList!.updatedAt).toEqual(expect.any(String));
                }
            } else {
                fail('mutationFn and onMutate should be defined');
            }
        });

        it('should handle empty list name - minimal version', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = '';

            queryClient.getQueryData.mockReturnValue(mockLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.onMutate) {
                await options.onMutate({ listId, listNewName });

                // Assert - Solo verificar que setQueryData fue llamado con userItemListsKey
                expect(queryClient.setQueryData).toHaveBeenCalledWith(
                    [userItemListsKey],
                    expect.anything()
                );
            } else {
                fail('onMutate should be defined');
            }
        });

        it('should handle very long list name', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'A'.repeat(1000); // Nombre muy largo

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert
            if (options.mutationFn) {
                await options.mutationFn({ listId, listNewName });
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledWith(listId, listNewName);
            } else {
                fail('mutationFn should be defined');
            }
        });

        it('should handle special characters in list name', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Lista @#$% con caractéres especiales ñ á é';

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert
            if (options.mutationFn) {
                await options.mutationFn({ listId, listNewName });
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledWith(listId, listNewName);
            } else {
                fail('mutationFn should be defined');
            }
        });
    });

    describe('performance and behavior', () => {
        it('should not make unnecessary API calls', async () => {
            // Arrange
            const listId = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listNewName = 'Test Name';

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act
            if (options.mutationFn) {
                // Llamar múltiples veces para verificar que no hay llamadas duplicadas
                await options.mutationFn({ listId, listNewName });
                await options.mutationFn({ listId, listNewName });

                // Assert - solo debería llamarse una vez por cada llamada a mutationFn
                expect(mockUserItemListRepository.updateList).toHaveBeenCalledTimes(2);
            } else {
                fail('mutationFn should be defined');
            }
        });

        it('should handle concurrent mutations correctly', async () => {
            // Arrange
            const listId1 = '123e4567-e89b-12d3-a456-426614174000' as UUID;
            const listId2 = '123e4567-e89b-12d3-a456-426614174001' as UUID;
            const listNewName1 = 'Nombre 1';
            const listNewName2 = 'Nombre 2';

            queryClient.getQueryData.mockReturnValue(mockLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const options = result.current;

            // Act & Assert
            if (options.onMutate) {
                // Simular múltiples mutaciones concurrentes
                const context1 = await options.onMutate({ listId: listId1, listNewName: listNewName1 });
                const context2 = await options.onMutate({ listId: listId2, listNewName: listNewName2 });

                // Ambas deberían tener su propio contexto
                expect(context1).toBeDefined();
                expect(context2).toBeDefined();
                expect(context1!.previousLists).toEqual(mockLists);
                expect(context2!.previousLists).toEqual(mockLists);
            } else {
                fail('onMutate should be defined');
            }
        });
    });
});