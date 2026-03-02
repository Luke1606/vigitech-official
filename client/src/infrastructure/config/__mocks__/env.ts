// src/infrastructure/config/__mocks__/env.ts
export const getEnv = jest.fn(() => ({
    VITE_SERVER_BASE_URL: 'http://localhost:3000',
    VITE_SITE_BASE_URL: 'http://localhost:3000',
    VITE_NOVU_APPLICATION_ID: 'test-novu-app-id',
    VITE_NOVU_SECRET_KEY: 'test-novu-secret-key',
    VITE_CLERK_PUBLISHABLE_KEY: 'test-clerk-key',
}));