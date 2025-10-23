// jest.setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(global, 'TextEncoder', {
    value: TextEncoder,
    writable: true
});

Object.defineProperty(global, 'TextDecoder', {
    value: TextDecoder,
    writable: true
});

jest.mock('@/infrastructure/config/env', () => ({
    getEnv: () => ({
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_NOVU_APPLICATION_ID: 'mock-novu-id',
        VITE_NOVU_SECRET_KEY: 'mock-novu-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key'
    })
}));

jest.mock('@/infrastructure', () => {
    return {
        AxiosConfiguredInstance: class {
            http = {
                get: jest.fn(),
                patch: jest.fn(),
                delete: jest.fn()
            };
        },
        getEnv: () => ({
            VITE_SERVER_BASE_URL: 'http://localhost:3000'
        })
    };
});




