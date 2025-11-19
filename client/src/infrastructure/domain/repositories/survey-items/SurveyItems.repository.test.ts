// src/infrastructure/domain/repositories/survey-items/SurveyItems.repository.test.ts

// Mock dependencies at the top
jest.mock('../../../config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'test-app-id',
        VITE_NOVU_SECRET_KEY: 'test-secret-key',
        VITE_CLERK_PUBLISHABLE_KEY: 'test-clerk-key'
    }))
}));

// Mock para AxiosConfiguredInstance
const mockHttpInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    request: jest.fn(),
    getUri: jest.fn(),
    defaults: { headers: {} },
    interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
    },
    create: jest.fn()
};

const MockAxiosConfiguredInstance = jest.fn(() => ({
    http: mockHttpInstance
}));

jest.mock('../../../utils/AxiosConfiguredInstance.util', () => ({
    AxiosConfiguredInstance: MockAxiosConfiguredInstance
}));

// Importar después de los mocks
import { SurveyItemsRepository, surveyItemsRepository } from './SurveyItems.repository';

// Mock data con tipado correcto
type UUID = `${string}-${string}-${string}-${string}-${string}`;

const MOCK_BASE_URL = 'http://localhost:3000';
const MOCK_ITEM_ID: UUID = '123e4567-e89b-12d3-a456-426614174000';
const MOCK_ITEM_IDS: UUID[] = [
    MOCK_ITEM_ID,
    '123e4567-e89b-12d3-a456-426614174001' as UUID,
    '123e4567-e89b-12d3-a456-426614174002' as UUID
];

const mockSurveyItem = {
    id: MOCK_ITEM_ID,
    title: 'Test Survey Item',
    description: 'Test Description',
    isSubscribed: false
};

const mockSurveyItems = [mockSurveyItem];

describe('SurveyItemsRepository', () => {
    let repository: SurveyItemsRepository;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset the repository instance
        repository = new SurveyItemsRepository();
    });

    describe('constructor', () => {
        it('should initialize with correct base URL', () => {
            expect(MockAxiosConfiguredInstance).toHaveBeenCalledWith(
                `${MOCK_BASE_URL}/survey-items/`
            );
        });
    });

    describe('findAllRecommended', () => {
        it('should fetch all recommended survey items', async () => {
            mockHttpInstance.get.mockResolvedValue({ data: mockSurveyItems });

            const result = await repository.findAllRecommended();

            expect(mockHttpInstance.get).toHaveBeenCalledWith('recommended');
            expect(result).toEqual({ data: mockSurveyItems });
        });

        it('should handle errors when fetching recommended items', async () => {
            const mockError = new Error('Network error');
            mockHttpInstance.get.mockRejectedValue(mockError);

            await expect(repository.findAllRecommended()).rejects.toThrow('Network error');
        });
    });

    describe('findAllSubscribed', () => {
        it('should fetch all subscribed survey items', async () => {
            mockHttpInstance.get.mockResolvedValue({ data: mockSurveyItems });

            const result = await repository.findAllSubscribed();

            expect(mockHttpInstance.get).toHaveBeenCalledWith('subscribed');
            expect(result).toEqual({ data: mockSurveyItems });
        });

        it('should handle errors when fetching subscribed items', async () => {
            const mockError = new Error('Network error');
            mockHttpInstance.get.mockRejectedValue(mockError);

            await expect(repository.findAllSubscribed()).rejects.toThrow('Network error');
        });
    });

    describe('findOne', () => {
        it('should fetch a single survey item by ID', async () => {
            mockHttpInstance.get.mockResolvedValue({ data: mockSurveyItem });

            const result = await repository.findOne(MOCK_ITEM_ID);

            expect(mockHttpInstance.get).toHaveBeenCalledWith(MOCK_ITEM_ID);
            expect(result).toEqual({ data: mockSurveyItem });
        });

        it('should handle errors when fetching single item', async () => {
            const mockError = new Error('Not found');
            mockHttpInstance.get.mockRejectedValue(mockError);

            await expect(repository.findOne(MOCK_ITEM_ID)).rejects.toThrow('Not found');
        });
    });

    describe('subscribeOne', () => {
        it('should subscribe to one survey item', async () => {
            mockHttpInstance.patch.mockResolvedValue({ data: undefined });

            await repository.subscribeOne(MOCK_ITEM_ID);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(`subscribe/${MOCK_ITEM_ID}`);
        });

        it('should handle errors when subscribing to one item', async () => {
            const mockError = new Error('Subscription failed');
            mockHttpInstance.patch.mockRejectedValue(mockError);

            await expect(repository.subscribeOne(MOCK_ITEM_ID)).rejects.toThrow('Subscription failed');
        });
    });

    describe('unsubscribeOne', () => {
        it('should unsubscribe from one survey item', async () => {
            mockHttpInstance.patch.mockResolvedValue({ data: undefined });

            await repository.unsubscribeOne(MOCK_ITEM_ID);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(`unsubscribe/${MOCK_ITEM_ID}`);
        });

        it('should handle errors when unsubscribing from one item', async () => {
            const mockError = new Error('Unsubscription failed');
            mockHttpInstance.patch.mockRejectedValue(mockError);

            await expect(repository.unsubscribeOne(MOCK_ITEM_ID)).rejects.toThrow('Unsubscription failed');
        });
    });

    describe('removeOne', () => {
        it('should remove one survey item', async () => {
            mockHttpInstance.delete.mockResolvedValue({ data: undefined });

            await repository.removeOne(MOCK_ITEM_ID);

            expect(mockHttpInstance.delete).toHaveBeenCalledWith(MOCK_ITEM_ID);
        });

        it('should handle errors when removing one item', async () => {
            const mockError = new Error('Deletion failed');
            mockHttpInstance.delete.mockRejectedValue(mockError);

            await expect(repository.removeOne(MOCK_ITEM_ID)).rejects.toThrow('Deletion failed');
        });
    });

    describe('subscribeBatch', () => {
        it('should subscribe to multiple survey items', async () => {
            mockHttpInstance.patch.mockResolvedValue({ data: undefined });

            await repository.subscribeBatch(MOCK_ITEM_IDS);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith('batch', { data: MOCK_ITEM_IDS });
        });

        it('should handle errors when batch subscribing', async () => {
            const mockError = new Error('Batch subscription failed');
            mockHttpInstance.patch.mockRejectedValue(mockError);

            await expect(repository.subscribeBatch(MOCK_ITEM_IDS)).rejects.toThrow('Batch subscription failed');
        });
    });

    describe('unsubscribeBatch', () => {
        it('should unsubscribe from multiple survey items', async () => {
            mockHttpInstance.patch.mockResolvedValue({ data: undefined });

            await repository.unsubscribeBatch(MOCK_ITEM_IDS);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith('batch', { data: MOCK_ITEM_IDS });
        });

        it('should handle errors when batch unsubscribing', async () => {
            const mockError = new Error('Batch unsubscription failed');
            mockHttpInstance.patch.mockRejectedValue(mockError);

            await expect(repository.unsubscribeBatch(MOCK_ITEM_IDS)).rejects.toThrow('Batch unsubscription failed');
        });
    });

    describe('removeBatch', () => {
        it('should remove multiple survey items', async () => {
            mockHttpInstance.delete.mockResolvedValue({ data: undefined });

            await repository.removeBatch(MOCK_ITEM_IDS);

            expect(mockHttpInstance.delete).toHaveBeenCalledWith('batch', { data: { itemIds: MOCK_ITEM_IDS } });
        });

        it('should handle errors when batch removing', async () => {
            const mockError = new Error('Batch deletion failed');
            mockHttpInstance.delete.mockRejectedValue(mockError);

            await expect(repository.removeBatch(MOCK_ITEM_IDS)).rejects.toThrow('Batch deletion failed');
        });
    });

    // Prueba alternativa para el singleton - más simple y directa
    describe('singleton instance', () => {
        it('should export a singleton instance', () => {
            // Verifica que la instancia exportada existe y tiene los métodos esperados
            expect(surveyItemsRepository).toBeDefined();
            expect(typeof surveyItemsRepository.findAllRecommended).toBe('function');
            expect(typeof surveyItemsRepository.findOne).toBe('function');
            expect(typeof surveyItemsRepository.subscribeOne).toBe('function');
        });

        it('should be the same instance across imports', () => {
            // Importa nuevamente para verificar que es la misma instancia
            const { surveyItemsRepository: sameInstance } = require('./SurveyItems.repository');
            expect(surveyItemsRepository).toBe(sameInstance);
        });
    });
});