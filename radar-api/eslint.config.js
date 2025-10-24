// @ts-nocheck

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
    {
        ignores: ['dist/**', 'node_modules/**', '.eslintrc.js'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                project: './tsconfig.json',
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            // Relax some strict runtime-type rules for pragmatic development
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            // Ensure Prettier and ESLint agree on formatting preferences
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                    tabWidth: 4,
                    singleQuote: true,
                    semi: true,
                },
            ],
        },
    },
    {
        files: ['**/*.js', '**/*.ts'],
    },
);
