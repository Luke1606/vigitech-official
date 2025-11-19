// useAppendAllItemsMutationOptions.test.tsx
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import {  QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import { useAppendAllItemsMutationOptions } from './appendAllItems.mutation';
import { userItemListsKey } from '../constants';
import type { UUID, SurveyItem, UserItemList } from '../../../..';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../../', () => ({
    userItemListRepository: {
        appendAllItems: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

const mockedUserItemListRepository = jest.mocked(userItemListRepository);
const mockedToast = jest.mocked(toast);

// Crear wrapper con QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useAppendAllItemsMutationOptions', () => {
    const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;
    const mockItemIds: UUID[] = [
        '123e4567-e89b-12d3-a456-426614174001' as UUID,
        '123e4567-e89b-12d3-a456-426614174002' as UUID,
    ];

    const mockPreviousList: UserItemList = {
        id: mockListId,
        name: 'Test List',
        items: [
            { id: 'existing-item-1' as UUID } as SurveyItem,
            { id: 'existing-item-2' as UUID } as SurveyItem,
        ],
    } as UserItemList;

    const mockResult: UserItemList = {
        ...mockPreviousList,
        items: [
            ...mockPreviousList.items,
            { id: mockItemIds[0] } as SurveyItem,
            { id: mockItemIds[1] } as SurveyItem,
        ],
    };

    const mockContext = { previousList: mockPreviousList };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return mutation options with correct structure', () => {
        const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
            wrapper: createWrapper(),
        });

        const options = result.current;
        expect(options).toBeDefined();
        expect(options.mutationFn).toBeDefined();
        expect(options.onMutate).toBeDefined();
        expect(options.onError).toBeDefined();
        expect(options.onSuccess).toBeDefined();
        expect(options.onSettled).toBeDefined();
    });

    describe('mutationFn', () => {
        it('should call repository with correct parameters', async () => {
            mockedUserItemListRepository.appendAllItems.mockResolvedValue(mockResult);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(),
            });

            // Usar el operador ! para afirmar que no es undefined
            const resultData = await result.current.mutationFn!({
                listId: mockListId,
                itemIds: mockItemIds
            });

            expect(mockedUserItemListRepository.appendAllItems)
                .toHaveBeenCalledWith(mockListId, mockItemIds);
            expect(resultData).toBe(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockError = new Error('Repository error');
            mockedUserItemListRepository.appendAllItems.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(),
            });

            await expect(
                result.current.mutationFn!({ listId: mockListId, itemIds: mockItemIds })
            ).rejects.toThrow('Repository error');
        });
    });

    describe('onMutate', () => {
        it('should perform optimistic update when previous list exists', async () => {
            // Crear un QueryClient específico para esta prueba
            const queryClient = new QueryClient();
            queryClient.setQueryData([userItemListsKey, mockListId], mockPreviousList);

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!({
                listId: mockListId,
                itemIds: mockItemIds
            });

            // Verificar que los datos se actualizaron correctamente
            const updatedData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(updatedData).toEqual({
                ...mockPreviousList,
                items: [
                    ...mockPreviousList.items,
                    { id: mockItemIds[0] },
                    { id: mockItemIds[1] },
                ],
            });

            expect(onMutateResult).toEqual({ previousList: mockPreviousList });
        });

        it('should not update cache when no previous list exists', async () => {
            const queryClient = new QueryClient();
            // No establecer datos previos

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const onMutateResult = await result.current.onMutate!({
                listId: mockListId,
                itemIds: mockItemIds
            });

            const currentData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(currentData).toBeUndefined();
            expect(onMutateResult).toEqual({ previousList: undefined });
        });
    });

    describe('onError', () => {
        it('should restore previous data and show error toast', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            // Corregir: pasar itemIds también en las variables
            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds }, // Agregar itemIds
                mockContext
            );

            // Verificar que se restauraron los datos anteriores
            const currentData = queryClient.getQueryData([userItemListsKey, mockListId]);
            expect(currentData).toEqual(mockPreviousList);

            expect(mockedToast.error).toHaveBeenCalledWith(
                'Error al añadir los elementos a la lista. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        it('should not restore data when no previousList in context', () => {
            const queryClient = new QueryClient();

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            // Corregir: pasar itemIds también en las variables
            result.current.onError!(
                mockError,
                { listId: mockListId, itemIds: mockItemIds }, // Agregar itemIds
                undefined
            );

            expect(mockedToast.error).toHaveBeenCalled();
            // No debería haber llamado a setQueryData ya que no hay contexto
        });
    });

    describe('onSuccess', () => {
        it('should show success toast', () => {
            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: createWrapper(),
            });

            // Corregir: pasar los parámetros requeridos
            result.current.onSuccess!(
                mockResult, // data
                { listId: mockListId, itemIds: mockItemIds }, // variables  
                mockContext // context
            );

            expect(mockedToast.success).toHaveBeenCalledWith(
                'Se añadieron con éxito los elementos.'
            );
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries for the list', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            // Corregir: pasar todos los parámetros requeridos
            result.current.onSettled!(
                mockResult, // data
                null, // error
                { listId: mockListId, itemIds: mockItemIds }, // variables
                mockContext // context
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
        });

        it('should handle onSettled with error', () => {
            const queryClient = new QueryClient();
            const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useAppendAllItemsMutationOptions(), {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            });

            const mockError = new Error('Mutation failed');

            // Caso con error
            result.current.onSettled!(
                undefined, // data (undefined cuando hay error)
                mockError, // error
                { listId: mockListId, itemIds: mockItemIds }, // variables
                mockContext // context
            );

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: [userItemListsKey, mockListId],
            });
        });
    });
});