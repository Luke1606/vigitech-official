import { useDispatch, useSelector } from 'react-redux';
import {
    type UserItemList,
    type SurveyItem,
    type ItemListState,
    setLists,
    upsertList,
    createList,
    updateListName,
    removeList,
    appendItem,
    appendItems,
    removeItem,
    removeItems,
    clearPendingChanges
} from '@/infrastructure';
import type { UUID } from "crypto";
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';

export const useUserItemLists = () => {
    const dispatch = useDispatch();

    const lists = useSelector((state: ItemListState) => state.lists);
    const pendingChanges = useSelector((state: ItemListState) => state.pendingChanges);

    const query = useUserItemListsAPI(); // tu hook de API para fetch/findAll/findOne

    return {
        ...query,
        lists,
        pendingChanges,

        setLists: (lists: (UserItemList & { id: UUID })[]) =>
            dispatch(setLists(lists)),

        upsertList: (list: UserItemList & { id: UUID }) =>
            dispatch(upsertList(list)),

        createList: (list: UserItemList & { id: UUID }) =>
            dispatch(createList(list)),

        updateListName: (listId: UUID, listName: string) =>
            dispatch(updateListName({ listId, listName })),

        removeList: (listId: UUID) =>
            dispatch(removeList(listId)),

        appendItem: (listId: UUID, item: SurveyItem) =>
            dispatch(appendItem({ listId, item })),

        appendItems: (listId: UUID, items: SurveyItem[]) =>
            dispatch(appendItems({ listId, items })),

        removeItem: (listId: UUID, itemId: UUID) =>
            dispatch(removeItem({ listId, itemId })),

        removeItems: (listId: UUID, itemIds: UUID[]) =>
            dispatch(removeItems({ listId, itemIds })),

        clearPendingChanges: () =>
            dispatch(clearPendingChanges())
    };
};
