import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useRunGlobalRecommendationsMutationOptions } from './runGlobalRecommendations.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        runGlobalRecommendations: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('useRunGlobalRecommendationsMutationOptions', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        jest.clearAllMocks();
        queryClient.clear();
    });

    test('should return mutation options with expected properties', () => {
        const { result } = renderHook(() => useRunGlobalRecommendationsMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.runGlobalRecommendations', async () => {
            const { result: optionsResult } = renderHook(
                () => useRunGlobalRecommendationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const mockData = { some: 'result' };
            (surveyItemsRepository.runGlobalRecommendations as jest.Mock).mockResolvedValueOnce(mockData);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.runGlobalRecommendations).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.runGlobalRecommendations).toHaveBeenCalledWith();
        });
    });

    describe('onSuccess', () => {
        test('should invalidate the recommended query and show success toast', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRunGlobalRecommendationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            (surveyItemsRepository.runGlobalRecommendations as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: [surveyItemsKey, 'recommended'],
            });
            expect(toast.success).toHaveBeenCalledWith('Recomendaciones generadas exitosamente.');
            expect(toast.error).not.toHaveBeenCalled();
        });
    });

    describe('onError', () => {
        test('should show error toast with the error message', async () => {
            const { result: optionsResult } = renderHook(
                () => useRunGlobalRecommendationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const errorMessage = 'Network failure';
            (surveyItemsRepository.runGlobalRecommendations as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            expect(toast.error).toHaveBeenCalledWith(`Error: ${errorMessage}`);
            expect(toast.success).not.toHaveBeenCalled();
        });

        test('should not invalidate queries on error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRunGlobalRecommendationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            (surveyItemsRepository.runGlobalRecommendations as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            expect(invalidateSpy).not.toHaveBeenCalled();
        });
    });
});