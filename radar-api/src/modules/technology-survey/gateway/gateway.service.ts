import type { UUID } from 'crypto';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { UserSubscribedItem, Item } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { ItemsClassificationService } from '../items-classification/items-classification.service';
import {
    CreateExistentItemClassification,
    CreateNewItemClassification,
} from '../shared/types/create-item-classification.type';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';
import { ItemWithClassification } from '../shared/types/classified-item.type';
import { InsightsWithCitations } from './types/insights-with-citations.type';
import { ClassificationChange } from '../shared/types/classification-change.type';

@Injectable()
export class ItemsGatewayService {
    private readonly logger: Logger = new Logger(ItemsGatewayService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly itemsClassificationService: ItemsClassificationService,
    ) {}

    /**
     * Busca todos los Items que son recomendados para el usuario actual.
     * Excluye aquellos que el usuario ha suscrito o ha marcado como ocultos.
     * @param userId UUID del usuario.
     * @returns Promesa que resuelve con un array de Items.
     */
    async findAllRecommended(userId: UUID): Promise<Item[]> {
        this.logger.log('Executed findAllRecommended');

        return this.prisma.item.findMany({
            where: {
                subscribedBy: {
                    none: { userId },
                },
                hiddenBy: {
                    none: { userId },
                },
            },
            include: {
                latestClassification: true,
            },
        });
    }

    /**
     * Busca todos los Items a los que el usuario se ha suscrito.
     * @param userId UUID del usuario.
     * @returns Promesa que resuelve con un array de Items suscritos.
     */
    async findAllSubscribed(userId: string): Promise<Item[]> {
        this.logger.log('Executed findAllSubscribed');

        return this.prisma.item.findMany({
            where: {
                subscribedBy: {
                    some: { userId },
                },
            },
            include: {
                latestClassification: true,
            },
        });
    }

    /**
     * Busca un Item específico por ID.
     * Lanza una ForbiddenException si el Item está marcado como oculto por el usuario.
     * @param id UUID del Item.
     * @param userId UUID del usuario que realiza la consulta.
     * @returns Promesa que resuelve con el Item encontrado.
     * @throws ForbiddenException si el Item está oculto.
     */
    async findOne(id: UUID, userId: UUID): Promise<Item> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: Item = await this.prisma.item.findUniqueOrThrow({
            where: { id },
        });

        const isHidden = await this.prisma.userHiddenItem.findUnique({
            where: {
                userId_itemId: {
                    userId,
                    itemId: id,
                },
            },
        });

        if (isHidden) {
            throw new ForbiddenException(`El item de id ${id} no está disponible para este usuario`);
        }

        return item;
    }

    /**
     * Crea un nuevo Item, lo clasifica mediante IA, lo guarda de forma atómica
     * junto con su clasificación inicial y suscribe al usuario que lo insertó.
     * La lógica de persistencia se delega a _saveNewItem (transaccional).
     * @param data DTO del Item sin clasificar.
     * @param insertedById UUID del usuario que inserta el Item.
     * @returns Promesa vacía al completar la creación.
     */
    async create(data: CreateUnclassifiedItemDto, insertedById: UUID): Promise<void> {
        this.logger.log('Executed create');

        const classificationInfo: CreateNewItemClassification =
            await this.itemsClassificationService.classifyNewItem(data);

        await this._saveNewItem(classificationInfo, insertedById);
    }

    /**
     * Suscribe al usuario a un Item específico.
     * También elimina cualquier registro de "oculto" para ese Item y usuario.
     * @param id UUID del Item a suscribir.
     * @param userId UUID del usuario.
     * @returns Promesa que resuelve con el registro de UserSubscribedItem creado/actualizado.
     */
    async subscribeOne(id: UUID, userId: UUID): Promise<UserSubscribedItem> {
        this.logger.log(`Executed subscribe of ${id}`);

        await this.prisma.item.findUniqueOrThrow({ where: { id } });

        await this.prisma.userHiddenItem.deleteMany({
            where: { userId, itemId: id },
        });

        return this.prisma.userSubscribedItem.upsert({
            where: { userId_itemId: { userId, itemId: id } },
            create: { userId, itemId: id },
            update: {},
        });
    }

    /**
     * Desuscribe al usuario de un Item específico.
     * @param id UUID del Item a desuscribir.
     * @param userId UUID del usuario.
     * @returns Promesa vacía al completar la operación.
     */
    async unsubscribeOne(id: UUID, userId: UUID): Promise<void> {
        this.logger.log(`Executed unsubscribe of ${id}`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: id,
            },
        });
    }

    /**
     * Procesa la eliminación o el ocultamiento de un solo Item.
     * Si el usuario creó el Item, se elimina permanentemente.
     * Si el Item es una recomendación, se oculta para el usuario.
     * @param id UUID del Item.
     * @param userId UUID del usuario que realiza la acción.
     * @returns Promesa vacía al completar la operación.
     */
    async removeOne(id: UUID, userId: UUID): Promise<void> {
        this.logger.log(`Executed remove of ${id}`);

        const item = await this.prisma.item.findUniqueOrThrow({
            where: { id },
            select: { insertedById: true },
        });

        if ((item.insertedById as UUID) === userId) {
            this.logger.log(`Item ${id} created by user. Deleting permanently.`);

            await this.prisma.item.delete({
                where: { id },
            });
        } else {
            this.logger.log(`Item ${id} is a recommendation. Hiding.`);

            await this.prisma.userSubscribedItem.deleteMany({
                where: {
                    itemId: id,
                    userId,
                },
            });

            await this.prisma.userHiddenItem.create({
                data: { itemId: id, userId },
            });
        }
    }

    /**
     * Crea un lote de Items.
     * 1. Clasifica todos los Items en batch (optimización de I/O con LLM).
     * 2. Persiste cada Item de forma concurrente en una transacción atómica (DB)
     * para garantizar la integridad del puntero de clasificación.
     * @param data Array de DTOs de Items sin clasificar.
     * @param insertedById ID del usuario que insertó el lote (opcional para inserción de sistema).
     * @returns Promesa vacía al completar la creación de todo el lote.
     */
    async createBatch(data: CreateUnclassifiedItemDto[], insertedById?: UUID): Promise<void> {
        const mode = insertedById ? 'MANUAL (User)' : 'AUTOMATIC (System)';
        this.logger.log(`Executed createBatch [${mode}] of ${data.length} items`);

        const classifiedItems: CreateNewItemClassification[] =
            await this.itemsClassificationService.classifyNewBatch(data);

        const savePromises = classifiedItems.map((classificationInfo) => {
            return this._saveNewItem(classificationInfo, insertedById);
        });

        // Ejecutamos todas las promesas de guardado concurrentemente.
        await Promise.all(savePromises);
    }

    /**
     * Suscribe al usuario a un lote de Items de forma masiva (createMany).
     * @param ids Array de UUIDs de Items a suscribir.
     * @param userId UUID del usuario.
     * @returns Promesa vacía al completar la operación.
     */
    async subscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed subscribe of ${ids.length} items`);

        await this.prisma.userSubscribedItem.createMany({
            data: ids.map((itemId) => ({
                userId,
                itemId,
            })),
            skipDuplicates: true,
        });
    }

    /**
     * Desuscribe al usuario de un lote de Items de forma masiva (deleteMany).
     * @param ids Array de UUIDs de Items a desuscribir.
     * @param userId UUID del usuario.
     * @returns Promesa vacía al completar la operación.
     */
    async unsubscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed unsubscribeBatch of ${ids.length} items`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: { in: ids },
            },
        });
    }

    /**
     * Procesa la eliminación o el ocultamiento de un lote de Items.
     * Divide la operación en Items propios (a eliminar) y Items recomendados (a ocultar).
     * @param ids Array de UUIDs de Items.
     * @param userId UUID del usuario que realiza la acción.
     * @returns Promesa vacía al completar la operación.
     */
    async removeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed remove of ${ids.length} items`);

        const itemsToCheck = await this.prisma.item.findMany({
            where: { id: { in: ids } },
            select: { id: true, insertedById: true },
        });

        const idsToDelete: string[] = [];
        const idsToHide: string[] = [];

        for (const item of itemsToCheck) {
            if (item.insertedById === userId) {
                idsToDelete.push(item.id);
            } else {
                idsToHide.push(item.id);
            }
        }

        if (idsToDelete.length > 0) {
            this.logger.log(`Deleting ${idsToDelete.length} user-owned items`);
            await this.prisma.item.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }

        if (idsToHide.length > 0) {
            this.logger.log(`Hiding ${idsToHide.length} recommended items`);

            await this.prisma.userSubscribedItem.deleteMany({
                where: {
                    userId: userId,
                    itemId: { in: idsToHide },
                },
            });

            await this.prisma.userHiddenItem.createMany({
                data: idsToHide.map((itemId) => ({
                    userId: userId,
                    itemId,
                })),
                skipDuplicates: true,
            });
        }
    }

    /**
     * Lógica transaccional central para crear un Item, su clasificación inicial
     * y actualizar el puntero rápido (latestClassificationId).
     * Incluye la autosuscripción del usuario que lo insertó si el ID está presente.
     * @param classificationInfo Datos clasificados y el DTO original.
     * @param insertedById UUID del usuario que insertó el Item (opcional).
     * @returns Promesa vacía que se ejecuta dentro de una transacción.
     */
    private async _saveNewItem(classificationInfo: CreateNewItemClassification, insertedById?: UUID): Promise<void> {
        const { unclassifiedItem, itemField, insightsValues, classification } = classificationInfo;

        // 0. Extracción de los IDs de fragmentos citados
        const { citedFragmentIds } = insightsValues as unknown as InsightsWithCitations;

        return this.prisma.$transaction(async (tx) => {
            // 1. Crear item
            const item = await tx.item.create({
                data: {
                    title: unclassifiedItem.title,
                    summary: unclassifiedItem.summary,
                    itemField,
                    insertedById,
                },
            });

            // 2. Crear primera clasificación (Historial)
            const itemClassification = await tx.itemClassification.create({
                data: {
                    itemId: item.id,
                    insightsValues,
                    classification,
                },
            });

            // 3. CREAR LOS ITEMCITEDFRAGMENT (Trazabilidad)
            if (citedFragmentIds && citedFragmentIds.length > 0) {
                const citationCreations = citedFragmentIds.map((fragmentId) =>
                    tx.itemCitedFragment.create({
                        data: {
                            itemId: item.id,
                            fragmentId: fragmentId,
                        },
                    }),
                );
                await Promise.all(citationCreations);
            }

            // 4. Actualizar puntero
            const finalItem = await tx.item.update({
                where: { id: item.id },
                data: {
                    latestClassificationId: itemClassification.id,
                    // La relación citedFragments del Item se actualiza implícitamente aquí
                },
            });

            // 5. Autosuscribir si es insertado por el usuario
            if (insertedById) {
                await tx.userSubscribedItem.upsert({
                    where: { userId_itemId: { userId: insertedById, itemId: finalItem.id } },
                    create: { userId: insertedById, itemId: finalItem.id },
                    update: {},
                });
            }
        });
    }

    /**
     * Busca todos los títulos de ítems existentes en la base de datos.
     * Utilizado por ItemsIdentifyingService para el filtro negativo RAG.
     * @returns Promesa que resuelve con un array de strings (títulos).
     */
    async findAllItemTitles(): Promise<string[]> {
        this.logger.log('Executed findAllItemTitles for RAG negative filtering.');

        const items = await this.prisma.item.findMany({
            select: { title: true },
        });

        return items.map((item: { title: string }) => item.title);
    }

    /**
     * Procesa la re-clasificación periódica de todos los ítems suscritos por un usuario.
     * Este método encapsula la obtención, clasificación y persistencia.
     * @param userId ID del usuario.
     */
    async reclassifySubscribedItems(userId: UUID): Promise<ClassificationChange[]> {
        this.logger.log(`Starting reclassification flow for subscribed items of user: ${userId}`);
        const classificationChanges: ClassificationChange[] = [];

        const itemsToReclassify = (await this.findAllSubscribed(userId)) as unknown as ItemWithClassification[];

        if (itemsToReclassify.length === 0) {
            this.logger.log(`User ${userId} has no items to reclassify.`);
            return [];
        }

        this.logger.log(`Processing ${itemsToReclassify.length} items for reclassification.`);

        // 1. Clasificar el lote de ítems (usando el servicio que invoca el LLM)
        const newClassifications: CreateExistentItemClassification[] =
            await this.itemsClassificationService.classifyExistentBatch(itemsToReclassify);

        // 2. Persistir las nuevas clasificaciones y rastrear las diferencias dentro de una transacción atómica
        await this.prisma.$transaction(async (tx) => {
            // Recorremos las nuevas clasificaciones generadas por la IA
            for (const newClassificationData of newClassifications) {
                const itemId = newClassificationData.item.id as UUID;
                const newClassificationValue = newClassificationData.classification;

                // a. Buscar el ítem original para obtener la clasificación anterior
                const originalItem = itemsToReclassify.find((item) => item.id === itemId);

                // b. Determinar el valor de la clasificación anterior para comparación
                const oldClassificationValue = (originalItem as ItemWithClassification)?.latestClassification
                    ?.classification;

                // c. Verificar si hubo un cambio (el nuevo valor es diferente del antiguo)
                if (oldClassificationValue !== newClassificationValue) {
                    // Registrar el cambio para el retorno (Task 2)
                    classificationChanges.push({
                        itemId: itemId,
                        newClassification: newClassificationValue,
                    });
                }

                // d. Persistir la nueva ItemClassification
                const itemClassification = await tx.itemClassification.create({
                    data: {
                        itemId: itemId,
                        insightsValues: newClassificationData.insightsValues,
                        classification: newClassificationValue,
                    },
                });

                // e. Actualizar el puntero 'latestClassificationId' en el Item
                await tx.item.update({
                    where: { id: itemId },
                    data: { latestClassificationId: itemClassification.id },
                });
            }
        });

        this.logger.log(
            `Reclassification completed for user: ${userId}. Found ${classificationChanges.length} changes.`,
        );

        // 3. Devolver la lista de elementos cambiados
        return classificationChanges;
    }

    /**
     * Persiste un lote de re-clasificaciones de Items existentes de forma transaccional.
     * @param classifications Array de clasificaciones (incluye itemId).
     */
    private async _saveReclassificationBatch(classifications: CreateExistentItemClassification[]): Promise<void> {
        this.logger.log(`Executing _saveReclassificationBatch for ${classifications.length} items.`);

        const savePromises = classifications.map((classificationInfo) => {
            return this._saveReclassification(classificationInfo);
        });

        await Promise.all(savePromises);
    }

    /**
     * Lógica transaccional para guardar una nueva clasificación de un Item existente.
     */
    private async _saveReclassification(classificationInfo: CreateExistentItemClassification): Promise<void> {
        const { item, insightsValues, classification } = classificationInfo;
        const itemId = item.id;
        // 0. Extracción de los IDs de fragmentos citados
        const { citedFragmentIds } = insightsValues as unknown as InsightsWithCitations;

        return this.prisma.$transaction(async (tx) => {
            // 1. Crear nueva clasificación (Historial)
            const itemClassification = await tx.itemClassification.create({
                data: {
                    itemId: itemId,
                    insightsValues,
                    classification,
                },
            });

            // 2. ELIMINAR LAS CITAS ANTIGUAS
            await tx.itemCitedFragment.deleteMany({
                where: { itemId },
            });

            // 3. CREAR LOS ITEMCITEDFRAGMENT NUEVOS (Trazabilidad)
            if (citedFragmentIds && citedFragmentIds.length > 0) {
                const citationCreations = citedFragmentIds.map((fragmentId) =>
                    tx.itemCitedFragment.create({
                        data: {
                            itemId: itemId,
                            fragmentId: fragmentId,
                        },
                    }),
                );
                await Promise.all(citationCreations);
            }

            // 4. Actualizar el puntero rápido (latestClassificationId)
            await tx.item.update({
                where: { id: itemId },
                data: { latestClassificationId: itemClassification.id, updatedAt: new Date() },
            });
        });
    }
}
