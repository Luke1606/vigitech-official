import type { UUID } from 'crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, UserItemList } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';

const itemSelection = {
    id: true,
    title: true,
    summary: true,
    itemField: true,
    latestClassification: true,
} satisfies Prisma.ItemSelect;

const listIncludeItems = {
    items: {
        select: itemSelection,
    },
} satisfies Prisma.UserItemListInclude;

/**
 * Servicio para la gestión de las listas de elementos personalizadas de los usuarios.
 * Permite realizar operaciones CRUD sobre las listas de elementos, así como añadir y eliminar elementos de las mismas.
 */
@Injectable()
export class UserItemListsService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Recupera todas las listas de elementos de un usuario específico.
     * @param ownerId El UUID del propietario de las listas.
     * @returns Una Promesa que resuelve con un array de objetos UserItemList.
     */
    async findAll(ownerId: UUID): Promise<UserItemList[]> {
        this.logger.log('Executed findAll');
        return await this.prisma.userItemList.findMany({
            where: { ownerId },
            include: listIncludeItems,
        });
    }

    /**
     * Recupera una lista de elementos específica por su ID.
     * @param id El UUID de la lista de elementos.
     * @param id El UUID de la lista de elementos.
     * @returns Una Promesa que resuelve con el objeto UserItemList.
     * @throws NotFoundException Si la lista de elementos no se encuentra.
     */
    async findOne(id: UUID): Promise<UserItemList> {
        this.logger.log('Executed findOne');
        return await this.prisma.userItemList.findUniqueOrThrow({
            where: { id },
            include: listIncludeItems,
        });
    }

    /**
     * Crea una nueva lista de elementos para un usuario.
     * @param ownerId El UUID del propietario de la lista.
     * @param data Los datos para crear la lista, incluyendo el título.
     * @returns Una Promesa que resuelve con el objeto UserItemList creado.
     */
    async createList(ownerId: UUID, data: CreateUserItemListDto): Promise<UserItemList> {
        this.logger.log('Executed createList');
        return this.prisma.userItemList.create({
            data: {
                ownerId,
                ...data,
            },
        });
    }

    /**
     * Actualiza una lista de elementos existente.
     * @param ownerId El UUID del propietario de la lista.
     * @param id El UUID de la lista de elementos a actualizar.
     * @param data Los datos para actualizar la lista.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    async updateList(ownerId: UUID, id: UUID, data: UpdateUserItemListDto): Promise<UserItemList> {
        this.logger.log('Executed updateList');
        return await this.prisma.userItemList.update({
            where: { id, ownerId },
            data,
            include: listIncludeItems,
        });
    }

    /**
     * Elimina una lista de elementos específica.
     * @param ownerId El UUID del propietario de la lista.
     * @param id El UUID de la lista de elementos a eliminar.
     * @returns Una Promesa que resuelve con el objeto UserItemList eliminado.
     */
    async removeList(ownerId: UUID, id: UUID): Promise<UserItemList> {
        this.logger.log('Executed removeList');
        return await this.prisma.userItemList.delete({
            where: { id, ownerId },
        });
    }

    /**
     * Añade un único elemento a una lista de elementos.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista a la que se añadirá el elemento.
     * @param itemId El UUID del elemento a añadir.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    async appendOneItem(ownerId: UUID, listId: UUID, itemId: UUID): Promise<UserItemList> {
        this.logger.log('Executed appendOneItem');
        await this.prisma.item.findUniqueOrThrow({ where: { id: itemId } });

        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    connect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    /**
     * Añade múltiples elementos a una lista de elementos.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista a la que se añadirán los elementos.
     * @param itemIds Un array de UUIDs de los elementos a añadir.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     * @throws NotFoundException Si uno o más elementos (SurveyItem) no existen en la base de datos.
     */
    async appendAllItems(ownerId: UUID, listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        this.logger.log('Executed appendAllItems');
        const items = await this.prisma.item.findMany({
            where: { id: { in: itemIds } },
        });

        if (items.length !== itemIds.length) {
            throw new NotFoundException('Uno o más items (SurveyItem) no existen en la base de datos.');
        }

        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    connect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    /**
     * Elimina un único elemento de una lista de elementos.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista de la que se eliminará el elemento.
     * @param itemId El UUID del elemento a eliminar.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    async removeOneItem(ownerId: UUID, listId: UUID, itemId: UUID): Promise<UserItemList> {
        this.logger.log('Executed removeOneItem');
        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    disconnect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    /**
     * Elimina múltiples elementos de una lista de elementos.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista de la que se eliminarán los elementos.
     * @param itemIds Un array de UUIDs de los elementos a eliminar.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    async removeAllItems(ownerId: UUID, listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        this.logger.log('Executed removeAllItems');
        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    disconnect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    /**
     * Obtiene los elementos de una lista de elementos específica.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista de la que se obtendrán los elementos.
     * @returns Una Promesa que resuelve con un objeto que contiene los elementos de la lista.
     */
    async getListItems(ownerId: UUID, listId: UUID) {
        this.logger.log('Executed getListItems');
        return await this.prisma.userItemList.findUnique({
            where: { id: listId, ownerId },
            select: listIncludeItems,
        });
    }

    /**
     * Comprueba si un elemento específico está presente en una lista de elementos.
     * @param ownerId El UUID del propietario de la lista.
     * @param listId El UUID de la lista a comprobar.
     * @param itemId El UUID del elemento a buscar.
     * @returns Una Promesa que resuelve con un booleano, true si el elemento está en la lista, false en caso contrario.
     */
    async isItemInList(ownerId: UUID, listId: UUID, itemId: UUID): Promise<boolean> {
        this.logger.log('Executed isItemInList');
        const count = await this.prisma.userItemList.count({
            where: {
                id: listId,
                ownerId,
                items: {
                    some: { id: itemId },
                },
            },
        });

        return count > 0;
    }
}
