import { UUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Item, Field, Classification } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { ItemsClassificationService } from '../../items-classification/items-classification.service';
import { ItemsGatewayService } from '../gateway.service';

const MOCK_USER_ID: UUID = 'user-id-123' as UUID;
const MOCK_ITEM_ID: UUID = 'item-id-456' as UUID;
const MOCK_CLASSIFICATION_ID: UUID = 'classification-id-789' as UUID;

const mockItem: Item = {
    id: MOCK_ITEM_ID,
    title: 'Test Item',
    summary: 'Summary',
    itemField: Field.BUSSINESS_INTEL,
    createdAt: new Date(),
    updatedAt: new Date(),
    latestClassificationId: MOCK_CLASSIFICATION_ID,
    insertedById: MOCK_USER_ID,
} as Item;

describe('ItemsGatewayService', () => {
    let service: ItemsGatewayService;
    let prisma: PrismaService;
    let itemsClassificationService: ItemsClassificationService;
    let mockPrismaTransaction: any;

    beforeEach(async () => {
        mockPrismaTransaction = {
            item: {
                create: jest.fn().mockResolvedValue(mockItem),
                update: jest.fn().mockResolvedValue(mockItem),
                delete: jest.fn().mockResolvedValue(mockItem),
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            itemClassification: {
                create: jest.fn().mockResolvedValue({ id: MOCK_CLASSIFICATION_ID }),
            },
            userSubscribedItem: {
                upsert: jest.fn().mockResolvedValue({}),
                deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            userHiddenItem: {
                createMany: jest.fn().mockResolvedValue({ count: 1 }),
                create: jest.fn().mockResolvedValue({}),
            },
            itemCitedFragment: {
                create: jest.fn().mockResolvedValue({}),
                deleteMany: jest.fn().mockResolvedValue({}),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsGatewayService,
                {
                    provide: PrismaService,
                    useValue: {
                        item: {
                            findMany: jest.fn(),
                            findUniqueOrThrow: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
                        },
                        userHiddenItem: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            createMany: jest.fn().mockResolvedValue({ count: 1 }),
                        },
                        userSubscribedItem: {
                            upsert: jest.fn(),
                            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
                            createMany: jest.fn(),
                        },
                        itemCitedFragment: {
                            deleteMany: jest.fn(),
                        },
                        $transaction: jest.fn((callback) => callback(mockPrismaTransaction)),
                    },
                },
                {
                    provide: ItemsClassificationService,
                    useValue: {
                        classifyNewItem: jest.fn(),
                        classifyNewBatch: jest.fn(),
                        classifyExistentBatch: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ItemsGatewayService>(ItemsGatewayService);
        prisma = module.get<PrismaService>(PrismaService);
        itemsClassificationService = module.get<ItemsClassificationService>(ItemsClassificationService);
    });

    // --- 1. CONSULTAS Y SEGURIDAD ---
    describe('findOne & Recommendations', () => {
        it('findOne: debe lanzar ForbiddenException si el item está oculto', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockItem);
            (prisma.userHiddenItem.findUnique as jest.Mock).mockResolvedValue({ id: 'hidden' });
            await expect(service.findOne(MOCK_ITEM_ID, MOCK_USER_ID)).rejects.toThrow(ForbiddenException);
        });

        it('findAllRecommended: debe filtrar por suscritos y ocultos', async () => {
            await service.findAllRecommended(MOCK_USER_ID);
            expect(prisma.item.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        subscribedBy: { none: { userId: MOCK_USER_ID } },
                        hiddenBy: { none: { userId: MOCK_USER_ID } },
                    },
                }),
            );
        });
    });

    // --- 2. CREACIÓN Y CLASIFICACIÓN ---
    describe('Creation & Classification', () => {
        it('create: debe clasificar y guardar un item individual', async () => {
            const dto = { title: 'New Item' };
            // CORRECCIÓN: El mock debe incluir unclassifiedItem para evitar el error de 'title'
            (itemsClassificationService.classifyNewItem as jest.Mock).mockResolvedValue({
                unclassifiedItem: dto,
                itemField: Field.BUSSINESS_INTEL,
                classification: Classification.ADOPT,
                itemSummary: 'Summary',
                insightsValues: { citedFragmentIds: [] },
            });

            await service.create(dto as any, MOCK_USER_ID);
            expect(mockPrismaTransaction.item.create).toHaveBeenCalled();
        });

        it('createBatch: debe llamar a _saveNewItem concurrentemente', async () => {
            const dto = [{ title: 'T1' }];
            (itemsClassificationService.classifyNewBatch as jest.Mock).mockResolvedValue([
                {
                    unclassifiedItem: dto[0],
                    insightsValues: { citedFragmentIds: ['f1'] },
                    classification: Classification.ADOPT,
                },
            ]);

            await service.createBatch(dto as any, MOCK_USER_ID);
            expect(mockPrismaTransaction.item.create).toHaveBeenCalled();
        });

        it('createBatch: debe procesar múltiples ítems y guardarlos concurrentemente', async () => {
            const dtos = [{ title: 'Tech 1' }, { title: 'Tech 2' }];

            // Mock de clasificación masiva
            (itemsClassificationService.classifyNewBatch as jest.Mock).mockResolvedValue([
                {
                    unclassifiedItem: dtos[0],
                    itemField: Field.SCIENTIFIC_STAGE,
                    classification: Classification.ADOPT,
                    itemSummary: 'Summary 1',
                    insightsValues: { citedFragmentIds: ['f1'] },
                },
                {
                    unclassifiedItem: dtos[1],
                    itemField: Field.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
                    classification: Classification.TEST,
                    itemSummary: 'Summary 2',
                    insightsValues: { citedFragmentIds: [] }, // Caso sin citas
                },
            ]);

            await service.createBatch(dtos as any, MOCK_USER_ID);

            // Verifica que se llamó a create para ambos ítems
            expect(mockPrismaTransaction.item.create).toHaveBeenCalledTimes(2);
            // Verifica que se crearon citas solo para el primer ítem
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalledTimes(1);
        });

        it('_saveReclassification: debe limpiar citas antiguas y crear las nuevas si existen', async () => {
            const infoWithCitations = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.ADOPT,
                insightsValues: { citedFragmentIds: ['frag-1', 'frag-2'] },
            };

            // Acceso a método privado para test de caja blanca
            await (service as any)._saveReclassification(infoWithCitations);

            expect(mockPrismaTransaction.itemCitedFragment.deleteMany).toHaveBeenCalledWith({
                where: { itemId: MOCK_ITEM_ID },
            });
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalledTimes(2);
        });

        it('_saveReclassification: no debe intentar crear citas si la lista está vacía (Rama else)', async () => {
            const infoNoCitations = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.HOLD,
                insightsValues: { citedFragmentIds: [] }, // Lista vacía
            };

            await (service as any)._saveReclassification(infoNoCitations);

            // Debe borrar pero NO crear
            expect(mockPrismaTransaction.itemCitedFragment.deleteMany).toHaveBeenCalled();
            expect(mockPrismaTransaction.itemCitedFragment.create).not.toHaveBeenCalled();
        });

        it('createBatch: debe ejecutar _saveNewItem para múltiples registros (Líneas 315-401)', async () => {
            const dtos = [{ title: 'Item 1' }, { title: 'Item 2' }];

            // Mock que simula una respuesta con y sin citas para cubrir ambos caminos del IF
            (itemsClassificationService.classifyNewBatch as jest.Mock).mockResolvedValue([
                {
                    unclassifiedItem: dtos[0],
                    itemField: Field.CLOUD_COMPUTING,
                    classification: Classification.ADOPT,
                    itemSummary: 'Summary 1',
                    insightsValues: { citedFragmentIds: ['frag-1'] }, // Con citas
                },
                {
                    unclassifiedItem: dtos[1],
                    itemField: Field.ARTIFICIAL_INTEL,
                    classification: Classification.TRIAL,
                    itemSummary: 'Summary 2',
                    insightsValues: { citedFragmentIds: [] }, // Sin citas (Rama Else)
                },
            ]);

            await service.createBatch(dtos as any, MOCK_USER_ID);

            // Verifica que se llamó a la transacción por cada ítem creado
            expect(mockPrismaTransaction.item.create).toHaveBeenCalledTimes(2);
            // Verifica que se intentó crear la cita solo para el ítem que la tenía
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalledTimes(1);
        });

        it('_saveReclassification: debe limpiar y crear nuevas citas si existen (Líneas 463-469)', async () => {
            const info = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.ADOPT,
                insightsValues: { citedFragmentIds: ['new-frag-1'] },
            };

            // Invocamos el método privado
            await (service as any)._saveReclassification(info);

            expect(mockPrismaTransaction.itemCitedFragment.deleteMany).toHaveBeenCalledWith({
                where: { itemId: MOCK_ITEM_ID },
            });
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalled();
        });

        it('_saveReclassification: no debe crear citas si la lista es nula o vacía (Rama Else)', async () => {
            const infoNoCitations = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.HOLD,
                insightsValues: { citedFragmentIds: null }, // O []
            };

            await (service as any)._saveReclassification(infoNoCitations);

            // El deleteMany siempre se ejecuta, el create no.
            expect(mockPrismaTransaction.itemCitedFragment.deleteMany).toHaveBeenCalled();
            expect(mockPrismaTransaction.itemCitedFragment.create).not.toHaveBeenCalled();
        });
    });

    // --- 3. ELIMINACIÓN (CORREGIDO) ---
    describe('Removal Logic', () => {
        it('removeOne: debe borrar físicamente si el usuario es el autor', async () => {
            (prisma.item.findUniqueOrThrow as jest.Mock).mockResolvedValue({ insertedById: MOCK_USER_ID });
            await service.removeOne(MOCK_ITEM_ID, MOCK_USER_ID);
            expect(prisma.item.delete).toHaveBeenCalled();
        });

        it('removeBatch: debe separar items propios de ajenos', async () => {
            (prisma.item.findMany as jest.Mock).mockResolvedValue([
                { id: '1', insertedById: MOCK_USER_ID }, // Para borrar
                { id: '2', insertedById: 'otro' }, // Para ocultar
            ]);

            await service.removeBatch(['1', '2'] as unknown as UUID[], MOCK_USER_ID);

            // Verificamos en prisma directamente, ya que removeBatch NO usa $transaction
            expect(prisma.item.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ['1'] } },
            });
            expect(prisma.userHiddenItem.createMany).toHaveBeenCalled();
        });
    });

    // --- 4. RE-CLASIFICACIÓN Y CITAS ---
    describe('Reclassification', () => {
        it('reclassifySubscribedItems: debe detectar cambios', async () => {
            const itemBase = { id: MOCK_ITEM_ID, latestClassification: { classification: Classification.HOLD } };
            jest.spyOn(service, 'findAllSubscribed').mockResolvedValue([itemBase as any]);
            (itemsClassificationService.classifyExistentBatch as jest.Mock).mockResolvedValue([
                { item: itemBase, classification: Classification.ADOPT, insightsValues: {} },
            ]);

            const result = await service.reclassifySubscribedItems(MOCK_USER_ID);
            expect(result[0].newClassification).toBe(Classification.ADOPT);
        });

        it('_saveReclassification: debe manejar ausencia de citas (Branch Coverage)', async () => {
            const info = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.ADOPT,
                insightsValues: { citedFragmentIds: null },
            };
            await (service as any)._saveReclassification(info);
            expect(mockPrismaTransaction.itemCitedFragment.create).not.toHaveBeenCalled();
        });

        it('_saveReclassification: debe crear citas si existen', async () => {
            const info = {
                item: { id: MOCK_ITEM_ID },
                classification: Classification.ADOPT,
                insightsValues: { citedFragmentIds: ['f1'] },
            };
            await (service as any)._saveReclassification(info);
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalled();
        });
    });

    describe('Cobertura Crítica: Ramas de Citas y Transacciones', () => {
        it('Líneas 315-401: _saveNewItem debe cubrir el flujo completo con citas', async () => {
            const mockClassified = {
                unclassifiedItem: { title: 'Test', summary: 'Desc' },
                itemField: 'CLOUD_COMPUTING',
                classification: 'ADOPT',
                itemSummary: 'AI Summary',
                insightsValues: { citedFragmentIds: ['id1', 'id2'] }, // Fuerza el IF de la línea 385
            };

            // Ejecutamos el método privado que maneja la lógica de la línea 315 en adelante
            await (service as any)._saveNewItem(mockClassified, MOCK_USER_ID);

            expect(mockPrismaTransaction.item.create).toHaveBeenCalled();
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalledTimes(2);
        });

        it('Líneas 315-401: _saveNewItem debe saltar la creación de citas si no existen', async () => {
            const mockNoCitations = {
                unclassifiedItem: { title: 'Test' },
                insightsValues: { citedFragmentIds: [] }, // Fuerza el ELSE/salto de línea 385
            };

            await (service as any)._saveNewItem(mockNoCitations, MOCK_USER_ID);

            expect(mockPrismaTransaction.itemCitedFragment.create).not.toHaveBeenCalled();
        });

        it('Líneas 463-469: _saveReclassification debe cubrir eliminación y creación de citas', async () => {
            const reclassInfo = {
                item: { id: MOCK_ITEM_ID },
                classification: 'HOLD',
                insightsValues: { citedFragmentIds: ['new-id'] },
            };

            await (service as any)._saveReclassification(reclassInfo);

            // Verifica limpieza de citas antiguas (Línea 458)
            expect(mockPrismaTransaction.itemCitedFragment.deleteMany).toHaveBeenCalledWith({
                where: { itemId: MOCK_ITEM_ID },
            });
            // Verifica creación de nuevas (Línea 464)
            expect(mockPrismaTransaction.itemCitedFragment.create).toHaveBeenCalled();
        });
    });
});
