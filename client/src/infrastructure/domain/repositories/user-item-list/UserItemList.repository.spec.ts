// __tests__/UserItemListRepository.spec.ts
import { userItemListRepository } from '@/infrastructure/domain/repositories/user-item-list/UserItemList.repository';
import { AxiosConfiguredInstance, RadarQuadrant, RadarRing, Trending } from '@/infrastructure';
import type { SurveyItem, UserItemList, UUID } from '@/infrastructure';

jest.mock('@/infrastructure', () => {
    const mockHttp = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
    };

    return {
        AxiosConfiguredInstance: jest.fn().mockImplementation(() => ({
            http: mockHttp
        })),
        getEnv: () => ({
            VITE_SERVER_BASE_URL: 'http://localhost:3000'
        }),
        RadarQuadrant: {
            BUSSINESS_INTEL: 'BUSSINESS_INTEL'
        },
        RadarRing: {
            ADOPT: 'ADOPT'
        },
        Trending: {
            DOWN: 'DOWN',
            UP: 'UP',
            STABLE: 'STABLE'
        }
    };
});

const mockHttp = (AxiosConfiguredInstance as jest.Mock).mock.results[0].value.http;

const listId = 'aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const itemId = '11111111-2222-3333-4444-555555555555';

const mockSurveyItem: SurveyItem = {
    id: itemId,
    title: 'Elemento A',
    summary: 'Resumen A',
    radarQuadrant: RadarQuadrant.BUSSINESS_INTEL,
    radarRing: RadarRing.ADOPT,
    lastAnalysis: {
        obtainedMetrics: {
            citations: 12,
            downloads: 340,
            relevance: 0.85,
            accesibilityLevel: 0,
            trending: Trending.DOWN
        },
        searchedDate: new Date('2025-10-20')
    }
};

const mockList: UserItemList = {
    id: listId,
    name: 'Mi Lista',
    items: [mockSurveyItem]
};

describe('UserItemListRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findAll debería retornar todas las listas', async () => {
        mockHttp.get.mockResolvedValueOnce([mockList]);
        const result = await userItemListRepository.findAll();
        expect(mockHttp.get).toHaveBeenCalledWith('');
        expect(result).toEqual([mockList]);
    });

    it('findOne debería retornar una lista específica', async () => {
        mockHttp.get.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.findOne(listId);
        expect(mockHttp.get).toHaveBeenCalledWith(listId);
        expect(result).toEqual(mockList);
    });

    it('createList debería crear una nueva lista', async () => {
        mockHttp.post.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.createList('Mi Lista');
        expect(mockHttp.post).toHaveBeenCalledWith('', 'Mi Lista');
        expect(result).toEqual(mockList);
    });

    it('updateList debería actualizar el nombre de la lista', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.updateList(listId, 'Nombre Actualizado');
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            listName: 'Nombre Actualizado'
        });
        expect(result).toEqual(mockList);
    });

    it('removeList debería eliminar una lista', async () => {
        mockHttp.delete.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeList(listId);
        expect(mockHttp.delete).toHaveBeenCalledWith(listId);
        expect(result).toEqual(mockList);
    });

    it('appendOneItem debería agregar un ítem a la lista', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.appendOneItem(listId, itemId);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemId
        });
        expect(result).toEqual(mockList);
    });

    it('appendAllItems debería agregar múltiples ítems a la lista', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.appendAllItems(listId, [itemId]);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemIds: [itemId]
        });
        expect(result).toEqual(mockList);
    });

    it('removeOneItem debería eliminar un ítem de la lista', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeOneItem(listId, itemId);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemId
        });
        expect(result).toEqual(mockList);
    });

    it('removeAllItems debería eliminar múltiples ítems de la lista', async () => {
        mockHttp.patch.mockResolvedValueOnce(mockList);
        const result = await userItemListRepository.removeAllItems(listId, [itemId]);
        expect(mockHttp.patch).toHaveBeenCalledWith(listId, {
            listId,
            itemIds: [itemId]
        });
        expect(result).toEqual(mockList);
    });

    // Pruebas de finales negativos

    it('findAll debería lanzar error si el backend falla', async () => {
        mockHttp.get.mockRejectedValueOnce(new Error('Error del servidor'));
        await expect(userItemListRepository.findAll()).rejects.toThrow('Error del servidor');
    });

    it('findOne debería lanzar error si el ID de la lista es inválido', async () => {
        mockHttp.get.mockRejectedValueOnce(new Error('ID inválido'));
        await expect(userItemListRepository.findOne('invalid-id' as UUID)).rejects.toThrow('ID inválido');
    });

    it('createList debería lanzar error si el backend rechaza la creación', async () => {
        mockHttp.post.mockRejectedValueOnce(new Error('Falló la creación'));
        await expect(userItemListRepository.createList('Mi Lista')).rejects.toThrow('Falló la creación');
    });

    it('updateList debería lanzar error si el nombre de la lista está vacío', async () => {
        mockHttp.patch.mockRejectedValueOnce(new Error('Nombre inválido'));
        await expect(userItemListRepository.updateList(listId, '')).rejects.toThrow('Nombre inválido');
    });

    it('removeList debería lanzar error si el backend falla al eliminar', async () => {
        mockHttp.delete.mockRejectedValueOnce(new Error('Falló la eliminación'));
        await expect(userItemListRepository.removeList(listId)).rejects.toThrow('Falló la eliminación');
    });

    it('appendOneItem debería lanzar error si el ID del ítem es inválido', async () => {
        mockHttp.patch.mockRejectedValueOnce(new Error('Ítem inválido'));
        await expect(userItemListRepository.appendOneItem(listId, 'bad-id' as UUID)).rejects.toThrow('Ítem inválido');
    });

    it('appendAllItems debería lanzar error si el array de ítems está vacío', async () => {
        mockHttp.patch.mockRejectedValueOnce(new Error('No se proporcionaron ítems'));
        await expect(userItemListRepository.appendAllItems(listId, [])).rejects.toThrow('No se proporcionaron ítems');
    });

    it('removeOneItem debería lanzar error si el backend falla al eliminar', async () => {
        mockHttp.patch.mockRejectedValueOnce(new Error('Falló la eliminación del ítem'));
        await expect(userItemListRepository.removeOneItem(listId, itemId)).rejects.toThrow('Falló la eliminación del ítem');
    });

    it('removeAllItems debería lanzar error si el array de ítems está mal formado', async () => {
        mockHttp.patch.mockRejectedValueOnce(new Error('Lista de ítems mal formada'));
        await expect(userItemListRepository.removeAllItems(listId, ['bad-id' as UUID])).rejects.toThrow('Lista de ítems mal formada');
    });
});
