import { findAllQueryOptions, findOneQueryOptions } from './findLists.query';
import { userItemListRepository } from '../../../..';
import { userItemListsKey } from '../constants';
import type { UUID } from 'crypto';
import { QueryClient } from '@tanstack/react-query';

jest.mock('../../../..', () => ({
    userItemListRepository: {
        findAll: jest.fn(),
        findOne: jest.fn(),
    },
}));

describe('query-options', () => {
    const mockListId: UUID = '11111111-2222-3333-4444-555555555555';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findAllQueryOptions should return correct query config', async () => {
        const options = findAllQueryOptions();

        expect(options.queryKey).toEqual([userItemListsKey]);
        expect(typeof options.queryFn).toBe('function');

        const mockContext = {
            client: new QueryClient(),
            queryKey: [userItemListsKey],
            signal: new AbortController().signal,
            meta: undefined,
        };

        await options.queryFn!(mockContext);
        expect(userItemListRepository.findAll).toHaveBeenCalled();
    });

    it('findOneQueryOptions should return correct query config with UUID', async () => {
        const options = findOneQueryOptions(mockListId);

        expect(options.queryKey).toEqual([userItemListsKey, mockListId]);
        expect(options.enabled).toBe(true);
        expect(typeof options.queryFn).toBe('function');

        const mockContext = {
            client: new QueryClient(),
            queryKey: [userItemListsKey, mockListId],
            signal: new AbortController().signal,
            meta: undefined,
        };

        await options.queryFn!(mockContext); // ✅ invocación segura
        expect(userItemListRepository.findOne).toHaveBeenCalledWith(mockListId);
    });


    it('findOneQueryOptions should disable query if listId is falsy', () => {
        const options = findOneQueryOptions('' as UUID);
        expect(options.enabled).toBe(false);
    });
});
