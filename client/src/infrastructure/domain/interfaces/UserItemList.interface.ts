import type { UUID } from "crypto";
import type { UserItemList } from "../types";

export interface UserItemListInterface {
    findAll: () => Promise<UserItemList[]>;
    findOne: (listId: UUID) => Promise<UserItemList>;
    createList: (listName: string) => Promise<UserItemList>;
    updateList: (listId: UUID, listName: string) => Promise<UserItemList>;
    removeList: (listId: UUID) => Promise<UserItemList>;
    appendOneItem: (listId: UUID, itemId: UUID) => Promise<UserItemList>;
    appendAllItems: (listId: UUID, itemIds: UUID[]) => Promise<UserItemList>;
    removeOneItem: (listId: UUID, itemId: UUID) => Promise<UserItemList>;
    removeAllItems: (listId: UUID, itemIds: UUID[]) => Promise<UserItemList>;
}