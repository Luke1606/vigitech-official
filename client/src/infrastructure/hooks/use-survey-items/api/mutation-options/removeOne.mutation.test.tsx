import type { UUID } from '../../../../';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { useRemoveOneMutationOptions } from './removeOne.mutation';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, recommendedKey, subscribedKey } from '../constants';
import { toast } from 'react-toastify';

// Mocks
jest.mock('../../../..', () => ({
    surveyItemsRepository: {
        removeOne: jest.fn(),
    },
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Helper para UUIDs falsos
const mockUUID = (id: number): UUID => `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}` as UUID;

// Tipo mínimo para pruebas
interface TestSurveyItem {
    id: UUID;
    title?: string;
}

describe('useRemoveOneMutationOptions', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;
    let mutationContext: { client: QueryClient; meta: Record<string, unknown> | undefined };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        mutationContext = { client: queryClient, meta: undefined };

        jest.clearAllMocks();
        queryClient.clear();
    });

    test('should return mutation options with expected properties', () => {
        const { result } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

        expect(result.current).toHaveProperty('mutationFn');
        expect(typeof result.current.mutationFn).toBe('function');
        expect(result.current).toHaveProperty('onMutate');
        expect(result.current).toHaveProperty('onError');
        expect(result.current).toHaveProperty('onSuccess');
        expect(result.current).toHaveProperty('onSettled');
    });

    describe('mutationFn', () => {
        test('should call surveyItemsRepository.removeOne with the provided UUID', async () => {
            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.removeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            expect(surveyItemsRepository.removeOne).toHaveBeenCalledTimes(1);
            expect(surveyItemsRepository.removeOne).toHaveBeenCalledWith(itemId);
        });
    });

    describe('onMutate', () => {
        test('should cancel ongoing queries, capture previous data, and optimistically remove the item from both lists', async () => {
            // Datos iniciales
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            const item3: TestSurveyItem = { id: mockUUID(3) };

            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2, item3]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1, item2]);

            const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            // Verificar cancelaciones
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            // Verificar contexto retornado
            expect(context).toEqual({
                previousRecommendations: [item1, item2, item3],
                previousSubscribed: [item1, item2],
            });

            // Verificar actualización optimista
            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const updatedSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(updatedRecommended).toEqual([item2, item3]); // item1 eliminado
            expect(updatedSubscribed).toEqual([item2]); // item1 eliminado
        });

        test('should handle case when there is no previous data (undefined)', async () => {
            const { result } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await result.current.onMutate!(itemId, mutationContext);

            expect(context).toEqual({
                previousRecommendations: undefined,
                previousSubscribed: undefined,
            });

            const updatedRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(updatedRecommended).toEqual([]); // old?.filter devuelve []
        });
    });

    describe('onSuccess', () => {
        test('should invalidate queries and show success toast', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.removeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // Verificar invalidaciones
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });

            // Toast de éxito
            expect(toast.success).toHaveBeenCalledWith('Se removió con éxito el elemento.');
        });
    });

    describe('onError', () => {
        test('should rollback to previous data and show error toast', async () => {
            // Datos iniciales
            const item1: TestSurveyItem = { id: mockUUID(1) };
            const item2: TestSurveyItem = { id: mockUUID(2) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1, item2]);
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [item1]);

            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            // Ejecutar onMutate para obtener contexto
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            // Simular error en la mutación
            optionsResult.current.onError!(new Error('Network error'), itemId, context, mutationContext);

            // Verificar restauración de datos
            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            const restoredSubscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);

            expect(restoredRecommended).toEqual([item1, item2]);
            expect(restoredSubscribed).toEqual([item1]);

            // Toast de error
            expect(toast.error).toHaveBeenCalledWith(
                'Error al remover el elemento seleccionado. Compruebe su conexión o inténtelo de nuevo.'
            );
        });

        test('should handle case where context is undefined (no optimistic update)', () => {
            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            optionsResult.current.onError!(new Error('Network error'), itemId, undefined, mutationContext);

            // No debería intentar restaurar nada
            const recommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(recommended).toBeUndefined();

            expect(toast.error).toHaveBeenCalled();
        });

        test('should rollback only the list that has previous data', async () => {
            // Solo recommended tiene datos
            const item1: TestSurveyItem = { id: mockUUID(1) };
            queryClient.setQueryData([surveyItemsKey, recommendedKey], [item1]);
            // subscribed no tiene datos inicialmente

            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const itemId = mockUUID(1);
            const context = await optionsResult.current.onMutate!(itemId, mutationContext);

            // Después de onMutate, ambas listas se actualizaron: recommended vacío, subscribed vacío (por el filter)
            // Modificamos subscribed manualmente para simular que recibió datos después
            queryClient.setQueryData([surveyItemsKey, subscribedKey], [{ id: mockUUID(2) }]);

            optionsResult.current.onError!(new Error('error'), itemId, context, mutationContext);

            // recommended debe restaurarse
            const restoredRecommended = queryClient.getQueryData([surveyItemsKey, recommendedKey]);
            expect(restoredRecommended).toEqual([item1]);

            // subscribed no se restaura porque no había datos previos, pero permanece como estaba después de onMutate? 
            // En onMutate se estableció a [], luego lo modificamos a [item2], y onError no lo toca porque context.previousSubscribed es undefined.
            // Por lo tanto, debe quedar en [item2].
            const subscribed = queryClient.getQueryData([surveyItemsKey, subscribedKey]);
            expect(subscribed).toEqual([{ id: mockUUID(2) }]);
        });
    });

    describe('onSettled', () => {
        test('should invalidate queries after success', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.removeOne as jest.Mock).mockResolvedValueOnce(undefined);

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isSuccess).toBe(true);
            });

            // onSuccess ya invalidó (2 llamadas) + onSettled (2 llamadas) = 4
            expect(invalidateSpy).toHaveBeenCalledTimes(4);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
        });

        test('should invalidate queries after error', async () => {
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result: optionsResult } = renderHook(() => useRemoveOneMutationOptions(), { wrapper });

            const { result: mutationResult } = renderHook(
                () => useMutation(optionsResult.current),
                { wrapper }
            );

            const itemId = mockUUID(1);
            (surveyItemsRepository.removeOne as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            mutationResult.current.mutate(itemId);

            await waitFor(() => {
                expect(mutationResult.current.isError).toBe(true);
            });

            // Solo onSettled invalida (2 llamadas)
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, recommendedKey] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [surveyItemsKey, subscribedKey] });
        });
    });
});