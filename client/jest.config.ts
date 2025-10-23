import { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: './tsconfig.app.json'
        }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.ts'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transformIgnorePatterns: [
        '/node_modules/(?!(@solid-primitives/props|solid-motionone)/)'
    ],

};

export default config;
