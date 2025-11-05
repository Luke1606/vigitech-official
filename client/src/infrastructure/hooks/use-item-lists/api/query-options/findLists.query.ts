import { queryOptions } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto'
import { userItemListsKey } from '../constants';
import type { UserItemList } from '../../../..';

// const getRealLists = () => {
//     const realLists: UserItemList[] = [
//         {
//             id: 'a-a-a-a-a',
//             name: 'a',
//             items: []
//         },
//         {
//             id: 'b-b-b-b-b',
//             name: 'b',
//             items: []
//         },
//         {
//             id: 'c-c-c-c-c',
//             name: 'c',
//             items: []
//         },
//     ]
//     return realLists;
// }

export const findAllQueryOptions = () => queryOptions({
    queryKey: [userItemListsKey],
    queryFn: () => userItemListRepository.findAll(),
    //queryFn: () => getRealLists()
})

export const findOneQueryOptions = (listId: UUID) => queryOptions({
    queryKey: [userItemListsKey, listId],
    queryFn: () => userItemListRepository.findOne(listId),
    enabled: !!listId,
})
