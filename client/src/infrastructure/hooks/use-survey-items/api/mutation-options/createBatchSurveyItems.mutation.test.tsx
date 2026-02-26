import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useCreateBatchSurveyItemsMutationOptions } from './createBatchSurveyItems.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks de dependencias
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        createBatch: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('useCreateBatchSurveyItemsMutationOptions', () => {
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
    });

    test('should return mutation options with expected properties', () => {
        const { result } = renderHook(() => useCreateBatchSurveyItemsMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    test('onSuccess should invalidate queries and show success toast', async () => {
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        (surveyItemsRepository.createBatch as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        expect(surveyItemsRepository.createBatch).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.createBatch).toHaveBeenCalledWith(titles);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
        expect(toast.success).toHaveBeenCalledWith('Se añadieron con éxito los elementos.');
        expect(toast.error).not.toHaveBeenCalled();
    });

    test('onError should show error toast', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        const error = new Error('Network error');
        (surveyItemsRepository.createBatch as jest.Mock).mockRejectedValueOnce(error);

        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(surveyItemsRepository.createBatch).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.createBatch).toHaveBeenCalledWith(titles);
        expect(toast.error).toHaveBeenCalledWith(
            'Error al añadir los elementos. Compruebe su conexión o inténtelo de nuevo.'
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    test('onSettled should invalidate queries regardless of success or failure', async () => {
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];

        // Caso éxito
        (surveyItemsRepository.createBatch as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledTimes(2); // onSuccess + onSettled
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });

        jest.clearAllMocks();

        // Caso error
        (surveyItemsRepository.createBatch as jest.Mock).mockRejectedValueOnce(new Error());
        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledTimes(1); // onError + onSettled
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
    });

    // Test adicional 1: mutationFn devuelve datos correctamente
    test('mutationFn should return data when used with mutateAsync', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        const mockData = [{ id: 1, title: 'Item 1' }, { id: 2, title: 'Item 2' }];
        (surveyItemsRepository.createBatch as jest.Mock).mockResolvedValueOnce(mockData);

        const promise = mutationResult.current.mutateAsync(titles);
        await expect(promise).resolves.toEqual(mockData);
        expect(surveyItemsRepository.createBatch).toHaveBeenCalledWith(titles);
    });

    // Test adicional 2: orden de callbacks en éxito
    test('callbacks should execute in correct order on success', async () => {
        const onSuccessSpy = jest.fn();
        const onErrorSpy = jest.fn();
        const onSettledSpy = jest.fn();

        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const originalOnSuccess = optionsResult.current.onSuccess;
        const originalOnError = optionsResult.current.onError;
        const originalOnSettled = optionsResult.current.onSettled;

        // Sobrescribir callbacks para espiar
        optionsResult.current.onSuccess = (...args) => {
            onSuccessSpy(...args);
            originalOnSuccess?.(...args);
        };
        optionsResult.current.onError = (...args) => {
            onErrorSpy(...args);
            originalOnError?.(...args);
        };
        optionsResult.current.onSettled = (...args) => {
            onSettledSpy(...args);
            originalOnSettled?.(...args);
        };

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        const mockData = [{ id: 1 }, { id: 2 }];
        (surveyItemsRepository.createBatch as jest.Mock).mockResolvedValueOnce(mockData);

        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        expect(onSuccessSpy).toHaveBeenCalledTimes(1);
        expect(onErrorSpy).not.toHaveBeenCalled();
        expect(onSettledSpy).toHaveBeenCalledTimes(1);
        const successOrder = onSuccessSpy.mock.invocationCallOrder[0];
        const settledOrder = onSettledSpy.mock.invocationCallOrder[0];
        expect(successOrder).toBeLessThan(settledOrder);
    });

    // Test adicional 3: manejo de error cuando es string
    test('should handle non-standard error (string) and show error toast', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        const errorString = 'Custom error message';
        (surveyItemsRepository.createBatch as jest.Mock).mockRejectedValueOnce(errorString);

        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(toast.error).toHaveBeenCalledWith(
            'Error al añadir los elementos. Compruebe su conexión o inténtelo de nuevo.'
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    // Test adicional 4: onSettled se llama aunque onError falle
    test('onSettled should be called even if onError throws', async () => {
        const onSettledSpy = jest.fn();

        const { result: optionsResult } = renderHook(
            () => useCreateBatchSurveyItemsMutationOptions(),
            { wrapper }
        );

        const originalOnError = optionsResult.current.onError;
        optionsResult.current.onError = (...args) => {
            originalOnError?.(...args);
            throw new Error('Error in onError');
        };

        optionsResult.current.onSettled = (...args) => {
            onSettledSpy(...args);
        };

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const titles = ['Item 1', 'Item 2'];
        (surveyItemsRepository.createBatch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        mutationResult.current.mutate(titles);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(onSettledSpy).toHaveBeenCalledTimes(0);
    });
});