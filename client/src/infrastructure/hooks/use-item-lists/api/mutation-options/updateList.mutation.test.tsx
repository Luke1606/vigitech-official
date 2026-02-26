import { renderHook } from '@testing-library/react';
import { useUpdateListMutationOptions } from './updateList.mutation';
import { userItemListRepository } from '../../../..';
import { toast } from 'react-toastify';
import type { UserItemList } from '../../../..';
import type { UUID } from '../../../../domain/types/UUID.type';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
    mutationOptions: jest.fn((options) => options),
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../..', () => ({
    userItemListRepository: {
        updateList: jest.fn(),
    },
    userItemListsKey: 'userItemLists',
}));

import { useQueryClient } from '@tanstack/react-query';
import { userItemListsKey } from '../constants';

describe('useUpdateListMutationOptions', () => {
    const mockQueryClient = {
        cancelQueries: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
    };

    const mockUpdateList = userItemListRepository.updateList as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    describe('mutationFn', () => {
        it('should call the repository with the correct parameters', async () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { mutationFn } = result.current;

            const listId = 'list-id' as UUID;
            const listNewName = 'New Name';
            await mutationFn!({ listId, listNewName }, {} as any);

            expect(mockUpdateList).toHaveBeenCalledWith(listId, listNewName);
        });

        it('should return the value from the repository', async () => {
            const expectedResult = { id: 'list-id', name: 'New Name' };
            mockUpdateList.mockResolvedValueOnce(expectedResult);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { mutationFn } = result.current;

            const listId = 'list-id' as UUID;
            const listNewName = 'New Name';
            const returnValue = await mutationFn!({ listId, listNewName }, {} as any);

            expect(returnValue).toBe(expectedResult);
        });
    });

    describe('onMutate', () => {
        it('should cancel ongoing queries, optimistically update the list, and return previous lists', async () => {
            const previousLists: UserItemList[] = [
                { id: 'list-id' as UUID, name: 'Old Name', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
                { id: 'other-id' as UUID, name: 'Other', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
            ];

            mockQueryClient.getQueryData.mockReturnValue(previousLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-id' as UUID, listNewName: 'Updated Name' };
            const context = await onMutate!(variables, {} as any);

            expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            expect(mockQueryClient.getQueryData).toHaveBeenCalledWith([userItemListsKey]);
            expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
                [userItemListsKey],
                expect.arrayContaining([
                    expect.objectContaining({ id: 'list-id', name: 'Updated Name', updatedAt: expect.any(String) }),
                    expect.objectContaining({ id: 'other-id', name: 'Other' }),
                ])
            );
            expect(context).toEqual({ previousLists });
        });

        it('should update only the targeted list and leave others unchanged', async () => {
            const previousLists: UserItemList[] = [
                { id: 'list-1' as UUID, name: 'List 1', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
                { id: 'list-2' as UUID, name: 'List 2', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
                { id: 'list-3' as UUID, name: 'List 3', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
            ];

            mockQueryClient.getQueryData.mockReturnValue(previousLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-2' as UUID, listNewName: 'Updated List 2' };
            await onMutate!(variables, {} as any);

            const setQueryDataCall = mockQueryClient.setQueryData.mock.calls[0];
            const updatedLists = setQueryDataCall[1] as UserItemList[];

            // Cast literals to UUID for comparison
            expect(updatedLists.find(l => l.id === ('list-2' as unknown as UUID))).toMatchObject({
                id: 'list-2' as unknown as UUID,
                name: 'Updated List 2',
            });
            expect(updatedLists.find(l => l.id === ('list-1' as unknown as UUID))).toMatchObject({
                id: 'list-1' as unknown as UUID,
                name: 'List 1',
            });
            expect(updatedLists.find(l => l.id === ('list-3' as unknown as UUID))).toMatchObject({
                id: 'list-3' as unknown as UUID,
                name: 'List 3',
            });
        });

        it('should set updatedAt as a valid ISO 8601 string', async () => {
            const previousLists: UserItemList[] = [
                { id: 'list-id' as UUID, name: 'Old Name', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
            ];

            mockQueryClient.getQueryData.mockReturnValue(previousLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-id' as UUID, listNewName: 'Updated Name' };
            await onMutate!(variables, {} as any);

            const setQueryDataCall = mockQueryClient.setQueryData.mock.calls[0];
            const updatedLists = setQueryDataCall[1] as UserItemList[];
            const updatedAt = updatedLists[0].updatedAt;

            expect(updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
        });

        it('should handle empty previousLists gracefully', async () => {
            mockQueryClient.getQueryData.mockReturnValue([]);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-id' as UUID, listNewName: 'Updated Name' };
            const context = await onMutate!(variables, {} as any);

            expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], []);
            expect(context).toEqual({ previousLists: [] });
        });

        it('should handle listId not found in previousLists', async () => {
            const previousLists: UserItemList[] = [
                { id: 'other-id' as UUID, name: 'Other', updatedAt: '2023-01-01T00:00:00Z' } as UserItemList,
            ];

            mockQueryClient.getQueryData.mockReturnValue(previousLists);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-id' as UUID, listNewName: 'Updated Name' };
            await onMutate!(variables, {} as any);

            expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], previousLists);
        });

        it('should not update cache if previousLists is undefined', async () => {
            mockQueryClient.getQueryData.mockReturnValue(undefined);

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onMutate } = result.current;

            const variables = { listId: 'list-id' as UUID, listNewName: 'Updated Name' };
            const context = await onMutate!(variables, {} as any);

            expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
            expect(context).toEqual({ previousLists: undefined });
        });
    });

    describe('onError', () => {
        it('should rollback to previous lists and show error toast', () => {
            const previousLists: UserItemList[] = [{ id: 'list-id' as UUID, name: 'Old Name' } as UserItemList];

            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onError } = result.current;

            const context = { previousLists };
            onError!(
                new Error('test error'),
                { listId: 'list-id' as UUID, listNewName: 'New' },
                context,
                {} as any
            );

            expect(mockQueryClient.setQueryData).toHaveBeenCalledWith([userItemListsKey], previousLists);
            expect(toast.error).toHaveBeenCalledWith('Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.');
        });

        it('should not rollback if previousLists was undefined', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onError } = result.current;

            const context = { previousLists: undefined };
            onError!(
                new Error('test error'),
                { listId: 'list-id' as UUID, listNewName: 'New' },
                context,
                {} as any
            );

            expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalled();
        });

        it('should show error toast with the correct message', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onError } = result.current;

            onError!(
                new Error('test error'),
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(toast.error).toHaveBeenCalledWith('Error al renombrar la lista. Compruebe su conexión o inténtelo de nuevo.');
        });
    });

    describe('onSuccess', () => {
        it('should invalidate queries and show success toast', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSuccess } = result.current;

            onSuccess!(
                {} as any,
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
            expect(toast.success).toHaveBeenCalledWith('Se renombró con éxito la lista.');
        });

        it('should invalidate queries exactly once', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSuccess } = result.current;

            onSuccess!(
                {} as any,
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);
        });

        it('should show success toast with the correct message', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSuccess } = result.current;

            onSuccess!(
                {} as any,
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(toast.success).toHaveBeenCalledWith('Se renombró con éxito la lista.');
        });
    });

    describe('onSettled', () => {
        it('should invalidate queries', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSettled } = result.current;

            onSettled!(
                undefined,
                null,
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: [userItemListsKey] });
        });

        it('should invalidate queries exactly once', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSettled } = result.current;

            onSettled!(
                undefined,
                null,
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);
        });

        it('should invalidate queries even after error', () => {
            const { result } = renderHook(() => useUpdateListMutationOptions());
            const { onSettled } = result.current;

            onSettled!(
                undefined,
                new Error('test error'),
                { listId: 'list-id' as UUID, listNewName: 'New' },
                { previousLists: undefined },
                {} as any
            );

            expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
        });
    });
});