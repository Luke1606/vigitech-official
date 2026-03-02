import type { UUID } from '../../../../';
import { findOneQueryOptions } from './findOne.query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        findOne: jest.fn(),
    },
}));

// Helper para UUIDs falsos
const mockUUID = (id: number): UUID => `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}` as UUID;

describe('findOneQueryOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return query options with expected properties', () => {
        const itemId = mockUUID(1);
        const options = findOneQueryOptions(itemId);

        expect(options).toHaveProperty('queryKey');
        expect(options).toHaveProperty('queryFn');
        expect(options).toHaveProperty('enabled');
        expect(options).toHaveProperty('refetchOnWindowFocus');
    });

    test('should construct queryKey with surveyItemsKey and itemId', () => {
        const itemId = mockUUID(1);
        const options = findOneQueryOptions(itemId);

        expect(options.queryKey).toEqual([surveyItemsKey, itemId]);
    });

    test('should set enabled to true when itemId is provided', () => {
        const itemId = mockUUID(1);
        const options = findOneQueryOptions(itemId);

        expect(options.enabled).toBe(true);
    });

    test('should set enabled to false when itemId is falsy', () => {
        const itemId = '' as UUID;
        const options = findOneQueryOptions(itemId);

        expect(options.enabled).toBe(false);
    });

    test('should set refetchOnWindowFocus to false', () => {
        const itemId = mockUUID(1);
        const options = findOneQueryOptions(itemId);

        expect(options.refetchOnWindowFocus).toBe(false);
    });

    test('queryFn should call surveyItemsRepository.findOne with the correct itemId', async () => {
        const itemId = mockUUID(1);
        const mockData = { id: itemId, name: 'Test Item' };
        (surveyItemsRepository.findOne as jest.Mock).mockResolvedValueOnce(mockData);

        const options = findOneQueryOptions(itemId);
        // Proporcionar un contexto mínimo requerido por TanStack Query
        const mockContext = { queryKey: options.queryKey, meta: undefined } as any;
        const result = await options.queryFn!(mockContext);

        expect(surveyItemsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.findOne).toHaveBeenCalledWith(itemId);
        expect(result).toBe(mockData);
    });
});