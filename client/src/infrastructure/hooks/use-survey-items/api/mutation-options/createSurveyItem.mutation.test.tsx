import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useCreateSurveyItemMutationOptions } from './createSurveyItem.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks de dependencias
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        create: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('useCreateSurveyItemMutationOptions', () => {
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
        const { result } = renderHook(() => useCreateSurveyItemMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    test('onSuccess should invalidate queries and show success toast', async () => {
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const title = 'Test Item';
        (surveyItemsRepository.create as jest.Mock).mockResolvedValueOnce({ id: 1 });

        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        expect(surveyItemsRepository.create).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.create).toHaveBeenCalledWith(title);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
        expect(toast.success).toHaveBeenCalledWith('Se añadió con éxito el elemento.');
        expect(toast.error).not.toHaveBeenCalled();
    });

    test('onError should show error toast', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const title = 'Test Item';
        const error = new Error('Network error');
        (surveyItemsRepository.create as jest.Mock).mockRejectedValueOnce(error);

        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(surveyItemsRepository.create).toHaveBeenCalledTimes(1);
        expect(surveyItemsRepository.create).toHaveBeenCalledWith(title);
        expect(toast.error).toHaveBeenCalledWith(
            'Error al añadir el elemento. Compruebe su conexión o inténtelo de nuevo.'
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    test('onSettled should invalidate queries regardless of success or failure', async () => {
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const title = 'Test Item';

        // Caso éxito
        (surveyItemsRepository.create as jest.Mock).mockResolvedValueOnce({ id: 1 });
        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isSuccess).toBe(true);
        });

        // Se llama dos veces: una en onSuccess y otra en onSettled
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });

        jest.clearAllMocks();

        // Caso error
        (surveyItemsRepository.create as jest.Mock).mockRejectedValueOnce(new Error());
        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        // En error, se llama una vez en onError y otra en onSettled, total 2
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey] });
    });

    // Test adicional 1: Verificar que mutationFn devuelve los datos correctamente
    test('mutationFn should call repository and return data when used in mutation', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const title = 'Test Item';
        const mockData = { id: 1, title };
        (surveyItemsRepository.create as jest.Mock).mockResolvedValueOnce(mockData);

        const promise = mutationResult.current.mutateAsync(title);
        await expect(promise).resolves.toEqual(mockData);
        expect(surveyItemsRepository.create).toHaveBeenCalledWith(title);
    });

    // Test adicional 2: Verificar orden de ejecución de callbacks en éxito
    test('callbacks should execute in correct order on success', async () => {
        const onSuccessSpy = jest.fn();
        const onErrorSpy = jest.fn();
        const onSettledSpy = jest.fn();

        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        // Envolver callbacks con espias para capturar orden
        const originalOnSuccess = optionsResult.current.onSuccess;
        const originalOnError = optionsResult.current.onError;
        const originalOnSettled = optionsResult.current.onSettled;

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

        const title = 'Test Item';
        (surveyItemsRepository.create as jest.Mock).mockResolvedValueOnce({ id: 1 });

        mutationResult.current.mutate(title);

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

    // Test adicional 3: Manejo de error cuando el error es un string (no estándar)
    test('should handle non-standard error (string) and show error toast', async () => {
        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        const { result: mutationResult } = renderHook(
            () => useMutation(optionsResult.current),
            { wrapper }
        );

        const title = 'Test Item';
        const errorString = 'Custom error message';
        (surveyItemsRepository.create as jest.Mock).mockRejectedValueOnce(errorString);

        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(toast.error).toHaveBeenCalledWith(
            'Error al añadir el elemento. Compruebe su conexión o inténtelo de nuevo.'
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    // Test adicional 4: Verificar que onSettled se llama incluso si onError lanza una excepción
    test('onSettled should be called even if onError throws', async () => {
        const onSettledSpy = jest.fn();

        const { result: optionsResult } = renderHook(
            () => useCreateSurveyItemMutationOptions(),
            { wrapper }
        );

        // Hacer que onError lance un error
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

        const title = 'Test Item';
        (surveyItemsRepository.create as jest.Mock).mockRejectedValueOnce(new Error('API error'));

        mutationResult.current.mutate(title);

        await waitFor(() => {
            expect(mutationResult.current.isError).toBe(true);
        });

        expect(onSettledSpy).toHaveBeenCalledTimes(0);
    });
});