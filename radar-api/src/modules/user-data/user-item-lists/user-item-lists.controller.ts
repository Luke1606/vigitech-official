import type { UUID } from 'crypto';
import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';

import { UserItemList } from '@prisma/client';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { UserItemListsService } from './user-item-lists.service';
import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';

/**
 * Controlador para la gestión de listas de elementos de usuario.
 * Proporciona endpoints para operaciones CRUD en las listas de elementos
 * y para añadir/eliminar elementos de estas listas.
 */
@Controller('user-data/item-lists')
export class UserItemListsController {
    private readonly logger: Logger;

    constructor(private readonly userItemListsService: UserItemListsService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Recupera todas las listas de elementos para el usuario autenticado.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con un array de objetos UserItemList.
     */
    @Get()
    async findAll(@Req() request: AuthenticatedRequest): Promise<UserItemList[]> {
        this.logger.log('Executed findAll');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.findAll(userId);
    }

    /**
     * Recupera una lista de elementos específica por su ID.
     * @param id El UUID de la lista de elementos.
     * @returns Una Promesa que resuelve con el objeto UserItemList.
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<UserItemList> {
        this.logger.log('Executed findOne');
        return await this.userItemListsService.findOne(id);
    }

    /**
     * Crea una nueva lista de elementos para el usuario autenticado.
     * @param data Los datos para crear la lista, incluyendo el título.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList creado.
     */
    @Post()
    async createList(@Body() data: CreateUserItemListDto, @Req() request: AuthenticatedRequest): Promise<UserItemList> {
        this.logger.log('Executed createList');
        const userId: UUID = request.userId as UUID;
        return this.userItemListsService.createList(userId, data);
    }

    /**
     * Actualiza una lista de elementos existente.
     * @param id El UUID de la lista de elementos a actualizar.
     * @param data Los datos para actualizar la lista.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    @Patch(':id')
    async updateList(
        @Param('id', ParseUUIDPipe) id: UUID,
        @Body() data: UpdateUserItemListDto,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed updateList');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.updateList(userId, id, data);
    }

    /**
     * Elimina una lista de elementos específica.
     * @param id El UUID de la lista de elementos a eliminar.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList eliminado.
     */
    @Delete(':id')
    async removeList(
        @Param('id', ParseUUIDPipe) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed findAll');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.removeList(userId, id);
    }

    /**
     * Añade un único elemento a una lista de elementos.
     * @param listId El UUID de la lista a la que se añadirá el elemento.
     * @param itemId El UUID del elemento a añadir.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    @Patch('item/:listId')
    async appendOneItem(
        @Param('listId') listId: UUID,
        @Body() itemId: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed findAll');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.appendOneItem(userId, listId, itemId);
    }

    /**
     * Añade múltiples elementos a una lista de elementos.
     * @param id El UUID de la lista a la que se añadirán los elementos.
     * @param itemIds Un array de UUIDs de los elementos a añadir.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    @Patch('batch/:listId')
    async appendAllItems(
        @Param('listId') id: UUID,
        @Body() itemIds: UUID[],
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed findAll');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.appendAllItems(userId, id, itemIds);
    }

    /**
     * Elimina un único elemento de una lista de elementos.
     * @param listId El UUID de la lista de la que se eliminará el elemento.
     * @param itemId El UUID del elemento a eliminar.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    @Delete('item/:listId')
    async removeOneItem(
        @Param('listId') listId: UUID,
        @Body() itemId: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed removeOneItem');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.removeOneItem(userId, listId, itemId);
    }

    /**
     * Elimina múltiples elementos de una lista de elementos.
     * @param id El UUID de la lista de la que se eliminarán los elementos.
     * @param itemIds Un array de UUIDs de los elementos a eliminar.
     * @param request La solicitud autenticada que contiene el ID del usuario.
     * @returns Una Promesa que resuelve con el objeto UserItemList actualizado.
     */
    @Delete('batch/:listId')
    async removeAllItems(
        @Param('listId') id: UUID,
        @Body() itemIds: UUID[],
        @Req() request: AuthenticatedRequest,
    ): Promise<UserItemList> {
        this.logger.log('Executed removeAllItems');
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.removeAllItems(userId, id, itemIds);
    }
}
