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
    clearListPendingChanges,
    type RootState,
    type AppDispatch
} from '../../';
import { useUserItemListsAPI } from './api/useUserItemListsAPI.hook';

export const useUserItemLists = () => {
    const dispatch = useDispatch<AppDispatch>();

    const lists = useSelector((state: RootState) => state.userItemLists.lists);
    const pendingChanges = useSelector((state: RootState) => state.userItemLists.pendingChanges);
    const synchronized = useSelector((state: RootState) => state.userItemLists.synchronized)

    const query = useUserItemListsAPI();

    return {
        query,
        lists,
        pendingChanges,
        synchronized,
        
        addPendingCreateList: (
            list: UserItemList
        ) =>
            dispatch(addPendingCreateList(list)),

        addPendingUpdateList: (
            listId: UUID, listNewName: string
        ) =>
            dispatch(addPendingUpdateList({ listId, listNewName })),

        addPendingRemoveList: (
            listId: UUID
        ) =>
            dispatch(addPendingRemoveList(listId)),

        addPendingAppendAllItems: (
            listId: UUID, items: SurveyItem[]
        ) =>
            dispatch(addPendingAppendAllItems({ listId, items })),

        addPendingRemoveAllItems: (
            listId: string, itemIds: UUID[]
        ) =>
            dispatch(addPendingRemoveAllItems({ listId, itemIds })),

        clearListPendingChanges: () => dispatch(
            clearListPendingChanges()
        )
    };
};
