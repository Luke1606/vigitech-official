// userItemListQueryOptions.test.ts
import { userItemListRepository } from '../../../..';
import { findAllQueryOptions, findOneQueryOptions } from '.';
import { userItemListsKey } from '../constants';
import type { UUID } from 'crypto';
import type { UserItemList } from '../../../..'
import { QueryClient } from '@tanstack/react-query';

// Mock completo del repositorio
jest.mock('../../../../', () => ({
    userItemListRepository: {
        findAll: jest.fn(),
        findOne: jest.fn(),
    },
}));

const mockedUserItemListRepository = jest.mocked(userItemListRepository);

// Crear datos mock que coincidan con la interfaz UserItemList
const createMockUserItemList = (id: UUID, name: string): UserItemList => ({
    id,
    name,
    items: [],
} as UserItemList);

// Crear un QueryClient mock
const mockQueryClient = new QueryClient();

// Mock completo del contexto de React Query
const createMockQueryContext = (queryKey: any[]) => ({
    client: mockQueryClient,
    signal: new AbortController().signal,
    queryKey,
    meta: {} as Record<string, unknown>,
    // Agregar propiedades opcionales que puedan existir
    pageParam: undefined,
    direction: undefined,
});

describe('User Item List Query Options', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllQueryOptions', () => {
        it('should return correct query options for fetching all lists', () => {
            const mockData: UserItemList[] = [
                createMockUserItemList('123e4567-e89b-12d3-a456-426614174000' as UUID, 'Lista 1'),
                createMockUserItemList('123e4567-e89b-12d3-a456-426614174001' as UUID, 'Lista 2'),
            ];

            mockedUserItemListRepository.findAll.mockResolvedValue(mockData);

            const options = findAllQueryOptions();

            // Verificar la estructura de las opciones
            expect(options.queryKey).toEqual([userItemListsKey]);
            expect(options.queryFn).toBeDefined();

            // Verificar que la queryFn ejecuta correctamente con el contexto
            const mockContext = createMockQueryContext([userItemListsKey]);
            return expect(options.queryFn!(mockContext)).resolves.toEqual(mockData);
        });

        it('should call repository findAll method', async () => {
            const mockData: UserItemList[] = [
                createMockUserItemList('123e4567-e89b-12d3-a456-426614174000' as UUID, 'Lista 1'),
            ];

            mockedUserItemListRepository.findAll.mockResolvedValue(mockData);

            const options = findAllQueryOptions();
            const mockContext = createMockQueryContext([userItemListsKey]);
            await options.queryFn!(mockContext);

            expect(mockedUserItemListRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOneQueryOptions', () => {
        const mockListId: UUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;

        it('should return correct query options for fetching single list', () => {
            const mockData: UserItemList = createMockUserItemList(mockListId, 'Lista individual');
            mockedUserItemListRepository.findOne.mockResolvedValue(mockData);

            const options = findOneQueryOptions(mockListId);

            expect(options.queryKey).toEqual([userItemListsKey, mockListId]);
            expect(options.enabled).toBe(true);

            const mockContext = createMockQueryContext([userItemListsKey, mockListId]);
            return expect(options.queryFn!(mockContext)).resolves.toEqual(mockData);
        });

        it('should disable query when listId is empty', () => {
            const emptyId = '' as UUID;
            const options = findOneQueryOptions(emptyId);

            expect(options.enabled).toBe(false);
        });

        it('should call repository findOne with correct parameter', async () => {
            const mockData: UserItemList = createMockUserItemList(mockListId, 'Lista individual');
            mockedUserItemListRepository.findOne.mockResolvedValue(mockData);

            const options = findOneQueryOptions(mockListId);
            const mockContext = createMockQueryContext([userItemListsKey, mockListId]);
            await options.queryFn!(mockContext);

            expect(mockedUserItemListRepository.findOne).toHaveBeenCalledWith(mockListId);
            expect(mockedUserItemListRepository.findOne).toHaveBeenCalledTimes(1);
        });

        it('should handle repository errors', () => {
            const error = new Error('Error de base de datos');
            mockedUserItemListRepository.findOne.mockRejectedValue(error);

            const options = findOneQueryOptions(mockListId);
            const mockContext = createMockQueryContext([userItemListsKey, mockListId]);

            return expect(options.queryFn!(mockContext)).rejects.toThrow('Error de base de datos');
        });

        it('should handle undefined or null listId', () => {
            const nullId = null as unknown as UUID;
            const optionsWithNull = findOneQueryOptions(nullId);
            expect(optionsWithNull.enabled).toBe(false);

            const undefinedId = undefined as unknown as UUID;
            const optionsWithUndefined = findOneQueryOptions(undefinedId);
            expect(optionsWithUndefined.enabled).toBe(false);
        });
    });
});