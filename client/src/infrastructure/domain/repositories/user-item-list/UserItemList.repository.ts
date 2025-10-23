import { UUID } from 'crypto';
import {
    type UserItemListInterface,
    type UserItemList
} from '../../..';
import { AxiosConfiguredInstance } from '../../../utils/AxiosConfiguredInstance.util';
import { getEnv } from '../../../config/env';
class UserItemListRepository implements UserItemListInterface {
    private readonly axios: AxiosConfiguredInstance;

    constructor() {

        this.axios = new AxiosConfiguredInstance(
            `${getEnv().VITE_SERVER_BASE_URL}/item-lists/`
        );

    }

    async findAll(): Promise<UserItemList[]> {
        return await this.axios.http
            .get('');
    };

    async findOne(
        listId: UUID
    ): Promise<UserItemList> {
        return await this.axios.http
            .get(`${listId}`);
    };

    async createList(
        listName: string
    ): Promise<UserItemList> {
        return await this.axios.http
            .post('', listName);
    };

    async updateList(
        listId: UUID,
        listName: string
    ): Promise<UserItemList> {
        return await this.axios.http
            .patch(`${listId}`, { listId, listName });
    };

    async removeList(
        listId: UUID
    ): Promise<UserItemList> {
        return await this.axios.http
            .delete(`${listId}`);
    };

    async appendOneItem(
        listId: UUID,
        itemId: UUID
    ): Promise<UserItemList> {
        return await this.axios.http
            .patch(`${listId}`, { listId, itemId });
    };

    async appendAllItems(
        listId: UUID,
        itemIds: UUID[]
    ): Promise<UserItemList> {
        return await this.axios.http
            .patch(`${listId}`, { listId, itemIds });
    };

    async removeOneItem(
        listId: UUID,
        itemId: UUID
    ): Promise<UserItemList> {
        return await this.axios.http
            .patch(`${listId}`, { listId, itemId });
    };

    async removeAllItems(
        listId: UUID,
        itemIds: UUID[]
    ): Promise<UserItemList> {
        return await this.axios.http
            .patch(`${listId}`, { listId, itemIds });
    };
}

export const userItemListRepository = new UserItemListRepository();