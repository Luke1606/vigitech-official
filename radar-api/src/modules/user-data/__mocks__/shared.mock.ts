import type { UUID } from 'crypto';
import {
    PrismaClient,
    Field,
    Classification,
    Item,
    UserItemList,
    UserSubscribedItem,
    UserHiddenItem,
} from '@prisma/client';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';

// ===========================================
// 1. CONSTANTES Y DATOS BASE
// ===========================================

export const MOCK_USER_ID: UUID = '00000000-0000-4000-8000-000000000002';
export const MOCK_ITEM_ID: UUID = '00000000-0000-4000-8000-000000000003';
export const MOCK_LIST_ID: UUID = '00000000-0000-4000-8000-000000000001';

export const MOCK_START_DATE = new Date('2023-01-01T00:00:00.000Z');
export const MOCK_END_DATE = new Date('2023-12-31T23:59:59.000Z');

// ===========================================
// 2. ENTIDADES DE PRISMA MOCKEADAS
// ===========================================

export const mockSurveyItem = {
    id: MOCK_ITEM_ID,
    title: 'Item de Prueba Global',
    summary: 'Resumen',
    itemField: Field.BUSSINESS_INTEL,
    latestClassificationId: Classification.ADOPT,
    createdAt: new Date(),
    updatedAt: new Date(),
} as Item;

export const mockUserItemList = {
    id: MOCK_LIST_ID,
    name: 'Lista de Prueba Global',
    ownerId: MOCK_USER_ID,
    preferredNotificationChannel: 'IN_APP',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
} as UserItemList;

export const mockUserSubscribedItem = {
    id: 'sub-id-1',
    userId: MOCK_USER_ID,
    itemId: MOCK_ITEM_ID,
    item: mockSurveyItem,
    createdAt: new Date(),
} as UserSubscribedItem;

export const mockUserHiddenItem = {
    id: 'hidden-id-1',
    userId: MOCK_USER_ID,
    itemId: MOCK_ITEM_ID,
    createdAt: new Date(),
} as UserHiddenItem;

// ===========================================
// 3. ERRORES COMUNES
// ===========================================

export const notFoundError = new Error('No se encontró el registro.');

// ===========================================
// 4. MOCKS DE DEPENDENCIAS DE SERVICIO
// ===========================================

// export const mockItemAnalysisService = {
//     findAllInsideIntervalFromObjective: jest.fn(),
//     findLastAnalysisFromItem: jest.fn(),
//     createAndGetAnalysisesFromSurveyItems: jest.fn(),
// };

// export const mockSurveyItemsService = {
//     findAllRecommended: jest.fn(),
//     findAllSubscribed: jest.fn(),
//     findOne: jest.fn(),
//     subscribeOne: jest.fn(),
//     unsubscribeOne: jest.fn(),
//     removeOne: jest.fn(),
//     subscribeBatch: jest.fn(),
//     unsubscribeBatch: jest.fn(),
//     removeBatch: jest.fn(),
// };

// Mock de UserItemListsService (necesario para las pruebas)
export const mockUserItemListsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createList: jest.fn(),
    updateList: jest.fn(),
    removeList: jest.fn(),
    appendOneItem: jest.fn(),
    appendAllItems: jest.fn(),
    removeOneItem: jest.fn(),
    removeAllItems: jest.fn(),
};

export const mockUserPreferencesService = {
    findActualUserPreferences: jest.fn(),
    createOrReturnToDefault: jest.fn(),
    update: jest.fn(),
};

// ===========================================
// 5. MOCKS DE SISTEMA/FRAMEWORK (Corregido para Jest/TS)
// ===========================================

// Definimos el tipo base para los delegados de Prisma para incluir `jest.Mock`
type MockDelegate = {
    findMany: jest.Mock;
    findUniqueOrThrow?: jest.Mock;
    create: jest.Mock;
    findFirstOrThrow?: jest.Mock;
    createManyAndReturn?: jest.Mock;
    findUnique?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
    deleteMany?: jest.Mock;
};

// Mock para PrismaClient
export const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),

    report: {
        create: jest.fn(),
    } as MockDelegate,

    userItemList: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    } as MockDelegate,

    surveyItem: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
    } as MockDelegate,

    item: { // Add the item delegate to the mock
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
    } as MockDelegate,

    userSubscribedItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
    } as MockDelegate,

    userHiddenItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
    } as MockDelegate,
} as unknown as PrismaClient;

// Mock para la solicitud autenticada (Controller)

// Mock para la solicitud autenticada (Controller)
export const mockAuthenticatedRequest = {
    userId: MOCK_USER_ID,
} as AuthenticatedRequest;
