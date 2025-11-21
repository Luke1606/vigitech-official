import { Module } from '@nestjs/common';
import { UserItemListsService } from './user-item-lists.service';
import { UserItemListsController } from './user-item-lists.controller';

/**
 * Módulo para la gestión de listas de elementos de usuario.
 * Proporciona los controladores y servicios necesarios para manejar las operaciones
 * relacionadas con las listas personalizadas de elementos de cada usuario.
 * @module UserItemLists
 */
@Module({
    controllers: [UserItemListsController],
    providers: [UserItemListsService],
})
export class UserItemListsModule {}
