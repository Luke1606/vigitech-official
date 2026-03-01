import { findSubscribedQueryOptions } from './findSubscribed.query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, subscribedKey } from '../constants';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        findAllSubscribed: jest.fn(),
    },
}));

describe('findSubscribedQueryOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return query options with expected properties', () => {
        const options = findSubscribedQueryOptions();

        expect(options).toHaveProperty('queryKey');
        expect(options).toHaveProperty('queryFn');
        expect(options).toHaveProperty('refetchOnWindowFocus');
    });

    test('should construct queryKey with surveyItemsKey and subscribedKey', () => {
        const options = findSubscribedQueryOptions();
        expect(options.queryKey).toEqual([surveyItemsKey, subscribedKey]);
    });

    test('should set refetchOnWindowFocus to false', () => {
        const options = findSubscribedQueryOptions();
        expect(options.refetchOnWindowFocus).toBe(false);
    });

    test('queryFn should call surveyItemsRepository.findAllSubscribed', async () => {
        const mockData = [{ id: '1', name: 'Subscribed Item 1' }];
        (surveyItemsRepository.findAllSubscribed as jest.Mock).mockResolvedValueOnce(mockData);

        const options = findSubscribedQueryOptions();
        // Proporcionar un contexto mínimo requerido por TanStack Query
        const mockContext = { queryKey: options.queryKey, meta: undefined } as any;
        const result = await options.queryFn!(mockContext);

        expect(surveyItemsRepository.findAllSubscribed).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.findAllSubscribed).toHaveBeenCalledWith();
        expect(result).toBe(mockData);
    });
});