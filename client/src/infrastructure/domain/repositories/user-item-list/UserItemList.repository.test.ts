// src/infrastructure/domain/repositories/user-item-list/UserItemList.repository.test.ts

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
import { UserItemListRepository } from './UserItemList.repository';

// Mock data con tipado correcto
type UUID = `${string}-${string}-${string}-${string}-${string}`;

const MOCK_BASE_URL = 'http://localhost:3000';
const MOCK_LIST_ID: UUID = '123e4567-e89b-12d3-a456-426614174000';
const MOCK_ITEM_ID: UUID = '123e4567-e89b-12d3-a456-426614174001';
const MOCK_ITEM_IDS: UUID[] = [
    MOCK_ITEM_ID,
    '123e4567-e89b-12d3-a456-426614174002' as UUID
];

const mockUserItemList = {
    id: MOCK_LIST_ID,
    name: 'Test List',
    items: [] as UUID[]
};

describe('UserItemListRepository', () => {
    let repository: UserItemListRepository;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset the repository instance
        repository = new UserItemListRepository();
    });

    describe('constructor', () => {
        it('should initialize with correct base URL', () => {
            expect(MockAxiosConfiguredInstance).toHaveBeenCalledWith(
                `${MOCK_BASE_URL}/item-lists`
            );
        });
    });

    describe('findAll', () => {
        it('should fetch all user item lists', async () => {
            const mockResponse = [mockUserItemList];
            mockHttpInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await repository.findAll();

            expect(mockHttpInstance.get).toHaveBeenCalledWith('');
            // El repositorio devuelve la respuesta completa de Axios, no solo data
            expect(result).toEqual({ data: mockResponse });
        });

        it('should handle errors when fetching all lists', async () => {
            const mockError = new Error('Network error');
            mockHttpInstance.get.mockRejectedValue(mockError);

            await expect(repository.findAll()).rejects.toThrow('Network error');
        });
    });

    describe('findOne', () => {
        it('should fetch a single list by ID', async () => {
            mockHttpInstance.get.mockResolvedValue({ data: mockUserItemList });

            const result = await repository.findOne(MOCK_LIST_ID);

            expect(mockHttpInstance.get).toHaveBeenCalledWith(MOCK_LIST_ID);
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: mockUserItemList });
        });

        it('should handle errors when fetching single list', async () => {
            const mockError = new Error('Not found');
            mockHttpInstance.get.mockRejectedValue(mockError);

            await expect(repository.findOne(MOCK_LIST_ID)).rejects.toThrow('Not found');
        });
    });

    describe('createList', () => {
        it('should create a new list with name', async () => {
            const listName = 'New Shopping List';
            const mockResponseData = { ...mockUserItemList, name: listName };
            mockHttpInstance.post.mockResolvedValue({ data: mockResponseData });

            const result = await repository.createList(listName);

            expect(mockHttpInstance.post).toHaveBeenCalledWith('', { name: listName });
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: mockResponseData });
        });
    });

    describe('updateList', () => {
        it('should update list name', async () => {
            const updatedName = 'Updated List Name';
            const mockResponseData = { ...mockUserItemList, name: updatedName };
            mockHttpInstance.patch.mockResolvedValue({ data: mockResponseData });

            const result = await repository.updateList(MOCK_LIST_ID, updatedName);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(
                MOCK_LIST_ID,
                { name: updatedName }
            );
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: mockResponseData });
        });
    });

    describe('removeList', () => {
        it('should delete a list', async () => {
            mockHttpInstance.delete.mockResolvedValue({ data: mockUserItemList });

            const result = await repository.removeList(MOCK_LIST_ID);

            expect(mockHttpInstance.delete).toHaveBeenCalledWith(MOCK_LIST_ID);
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: mockUserItemList });
        });
    });

    describe('appendOneItem', () => {
        it('should append one item to list', async () => {
            const updatedListData = {
                ...mockUserItemList,
                items: [MOCK_ITEM_ID]
            };
            mockHttpInstance.patch.mockResolvedValue({ data: updatedListData });

            const result = await repository.appendOneItem(MOCK_LIST_ID, MOCK_ITEM_ID);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(
                MOCK_LIST_ID,
                { listId: MOCK_LIST_ID, itemId: MOCK_ITEM_ID }
            );
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: updatedListData });
        });
    });

    describe('appendAllItems', () => {
        it('should append multiple items to list', async () => {
            const updatedListData = {
                ...mockUserItemList,
                items: MOCK_ITEM_IDS
            };
            mockHttpInstance.patch.mockResolvedValue({ data: updatedListData });

            const result = await repository.appendAllItems(MOCK_LIST_ID, MOCK_ITEM_IDS);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(
                MOCK_LIST_ID,
                { listId: MOCK_LIST_ID, itemIds: MOCK_ITEM_IDS }
            );
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: updatedListData });
        });
    });

    describe('removeOneItem', () => {
        it('should remove one item from list', async () => {
            const updatedListData = {
                ...mockUserItemList,
                items: []
            };
            mockHttpInstance.patch.mockResolvedValue({ data: updatedListData });

            const result = await repository.removeOneItem(MOCK_LIST_ID, MOCK_ITEM_ID);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(
                MOCK_LIST_ID,
                { listId: MOCK_LIST_ID, itemId: MOCK_ITEM_ID }
            );
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: updatedListData });
        });
    });

    describe('removeAllItems', () => {
        it('should remove multiple items from list', async () => {
            const updatedListData = {
                ...mockUserItemList,
                items: []
            };
            mockHttpInstance.patch.mockResolvedValue({ data: updatedListData });

            const result = await repository.removeAllItems(MOCK_LIST_ID, MOCK_ITEM_IDS);

            expect(mockHttpInstance.patch).toHaveBeenCalledWith(
                MOCK_LIST_ID,
                { listId: MOCK_LIST_ID, itemIds: MOCK_ITEM_IDS }
            );
            // El repositorio devuelve la respuesta completa de Axios
            expect(result).toEqual({ data: updatedListData });
        });
    });
});