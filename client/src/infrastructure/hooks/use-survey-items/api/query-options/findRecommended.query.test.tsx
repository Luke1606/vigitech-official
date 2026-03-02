import { findRecommendedQueryOptions } from './findRecommended.query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, recommendedKey } from '../constants';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        findAllRecommended: jest.fn(),
    },
}));

describe('findRecommendedQueryOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return query options with expected properties', () => {
        const options = findRecommendedQueryOptions();

        expect(options).toHaveProperty('queryKey');
        expect(options).toHaveProperty('queryFn');
    });

    test('should construct queryKey with surveyItemsKey and recommendedKey', () => {
        const options = findRecommendedQueryOptions();
        expect(options.queryKey).toEqual([surveyItemsKey, recommendedKey]);
    });

    test('queryFn should call surveyItemsRepository.findAllRecommended', async () => {
        const mockData = [{ id: '1', name: 'Item 1' }];
        (surveyItemsRepository.findAllRecommended as jest.Mock).mockResolvedValueOnce(mockData);

        const options = findRecommendedQueryOptions();
        // Proporcionar un contexto mínimo requerido por TanStack Query
        const mockContext = { queryKey: options.queryKey, meta: undefined } as any;
        const result = await options.queryFn!(mockContext);

        expect(surveyItemsRepository.findAllRecommended).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.findAllRecommended).toHaveBeenCalledWith();
        expect(result).toBe(mockData);
    });
});