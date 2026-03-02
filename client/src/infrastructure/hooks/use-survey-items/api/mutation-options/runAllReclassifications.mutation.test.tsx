import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useRunAllReclassificationsMutationOptions } from './runAllReclassifications.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        runAllReclassifications: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe('useRunAllReclassificationsMutationOptions', () => {
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
        const { result } = renderHook(() => useRunAllReclassificationsMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.runAllReclassifications', async () => {
            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const mockData = [{ id: 1, updated: true }];
            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockResolvedValueOnce(mockData);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.runAllReclassifications).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.runAllReclassifications).toHaveBeenCalledWith();
        });
    });

    describe('onSuccess', () => {
        test('should show success toast and invalidate queries when data is not empty', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const mockData = [{ id: 1, title: 'Updated Item' }];
            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockResolvedValueOnce(mockData);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(toast.success).toHaveBeenCalledWith('Elementos reclasificados exitosamente.');
            expect(toast.info).not.toHaveBeenCalled();
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
        });

        test('should show info toast and invalidate queries when data is empty array', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const mockData: any[] = [];
            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockResolvedValueOnce(mockData);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(toast.info).toHaveBeenCalledWith('No se encontraron cambios en los elementos.');
            expect(toast.success).not.toHaveBeenCalled();
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
        });

        test('should show success toast if data is not an array (fallback)', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const mockData = { some: 'object' };
            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockResolvedValueOnce(mockData);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(toast.success).toHaveBeenCalledWith('Elementos reclasificados exitosamente.');
            expect(toast.info).not.toHaveBeenCalled();
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('onError', () => {
        test('should show error toast', async () => {
            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const error = new Error('Network error');
            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockRejectedValueOnce(error);

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            expect(toast.error).toHaveBeenCalledWith(
                'Error al reclasificar los elementos. Inténtelo de nuevo o compruebe su conexión.'
            );
            expect(toast.success).not.toHaveBeenCalled();
            expect(toast.info).not.toHaveBeenCalled();
        });

        test('should handle error without affecting cache', async () => {
            const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');

            const { result: optionsResult } = renderHook(
                () => useRunAllReclassificationsMutationOptions(),
                { wrapper }
            );

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            (surveyItemsRepository.runAllReclassifications as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate();

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            expect(setQueryDataSpy).not.toHaveBeenCalled();
        });
    });
});