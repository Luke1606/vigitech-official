import { queryOptions } from '@tanstack/react-query';
import { userItemListRepository } from '../../../..';
import type { UUID } from 'crypto'
import { userItemListsKey } from '../constants';

export const findAllQueryOptions = () => queryOptions({
    queryKey: [userItemListsKey],
    queryFn: () => userItemListRepository.findAll(),
})

export const findOneQueryOptions = (listId: UUID) => queryOptions({
    queryKey: [userItemListsKey, listId],
    queryFn: () => userItemListRepository.findOne(listId),
    enabled: !!listId,
})
