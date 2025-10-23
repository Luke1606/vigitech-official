import type { UUID } from 'crypto';
import { useDispatch, useSelector } from 'react-redux';
import {
    type UserItemList,
    type SurveyItem,
    addPendingCreateList,
    addPendingUpdateList,
    addPendingRemoveList,
    addPendingAppendAllItems,
    addPendingRemoveAllItems,
    clearPendingChanges,
    type RootState,
    type AppDispatch
} from '../..';
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';

export const useUserItemLists = () => {
    const dispatch = useDispatch<AppDispatch>();

    const lists = useSelector((state: RootState) => state.itemLists.lists);
    const pendingChanges = useSelector((state: RootState) => state.itemLists.pendingChanges);

    const query = useUserItemListsAPI();

    return {
        ...query,
        lists,
        pendingChanges,

        addPendingCreateList: (
            list: UserItemList
        ) =>
            dispatch(addPendingCreateList(list)),

        addPendingUpdateList: (
            listId: string, listNewName: string
        ) =>
            dispatch(addPendingUpdateList({ listId, listNewName })),

        addPendingRemoveList: (
            listId: string
        ) =>
            dispatch(addPendingRemoveList(listId)),

        addPendingAppendAllItems: (
            listId: string, items: SurveyItem[]
        ) =>
            dispatch(addPendingAppendAllItems({ listId, items })),

        addPendingRemoveAllItems: (
            listId: string, itemIds: UUID[]
        ) =>
            dispatch(addPendingRemoveAllItems({ listId, itemIds })),

        clearPendingChanges: () => dispatch(
            clearPendingChanges()
        )
    };
};
