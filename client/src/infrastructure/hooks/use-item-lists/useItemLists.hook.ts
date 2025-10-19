import { useDispatch, useSelector } from 'react-redux';
import {
    type UserItemList,
    type SurveyItem,
    type ItemListState,
    upsertList,
    createList,
    updateList,
    removeList,
    appendOneItem,
    appendAllItems,
    removeOneItem,
    removeAllItems,
    clearPendingChanges
} from '@/infrastructure';
import type { UUID } from "crypto";
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';

export const useUserItemLists = () => {
    const dispatch = useDispatch();

    const lists = useSelector((state: ItemListState) => state.lists);
    const pendingChanges = useSelector((state: ItemListState) => state.pendingChanges);

    const query = useUserItemListsAPI();

    return {
        ...query,
        lists,
        pendingChanges,

        upsertList: (
            list: UserItemList & { id: UUID }
        ) => dispatch(
            upsertList(list)
        ),

        createList: (
            list: UserItemList & { id: UUID }
        ) =>
            dispatch(createList(list)),

        updateListName: (
            listId: UUID, listName: string
        ) =>
            dispatch(updateList({ listId, listName })),

        removeList: (
            listId: UUID
        ) =>
            dispatch(removeList(listId)),

        appendItem: (
            listId: UUID, item: SurveyItem
        ) =>
            dispatch(appendOneItem({ listId, item })),

        appendItems: (
            listId: UUID, items: SurveyItem[]
        ) =>
            dispatch(appendAllItems({ listId, items })),

        removeItem: (
            listId: UUID, itemId: UUID
        ) =>
            dispatch(removeOneItem({ listId, itemId })),

        removeItems: (
            listId: UUID, itemIds: UUID[]
        ) =>
            dispatch(removeAllItems({ listId, itemIds })),

        clearPendingChanges: () => dispatch(
            clearPendingChanges()
        )
    };
};
