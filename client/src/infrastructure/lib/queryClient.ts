// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
// 1. Change the import
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 1000 * 60 * 60 * 24,
            retry: 2,
        },
        mutations: {
            retry: 1,
        },
    },
});

const localStoragePersister = createAsyncStoragePersister({
    storage: window.localStorage,
    key: 'REACT_QUERY_CACHE',
});

persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    buster: 'v1',
});