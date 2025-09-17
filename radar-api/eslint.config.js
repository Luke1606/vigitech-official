// @ts-check

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
        },
    },
    {
        files: ['**/*.js', '**/*.ts'],
    },
);
