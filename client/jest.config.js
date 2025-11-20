export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-query|@tanstack/react-query)/)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.jest.json'
        }],
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
    ],
    moduleDirectories: ['node_modules', 'src'],
};