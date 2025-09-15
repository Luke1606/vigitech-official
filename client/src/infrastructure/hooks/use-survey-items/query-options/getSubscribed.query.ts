import { queryOptions } from '@tanstack/react-query';
import { surveyItemsRepository } from '@/infrastructure';
import { surveyItemsKey, subscribedKey } from '../constants';

export const getSubscribedQueryOptions = () => queryOptions({
    queryKey: [
        surveyItemsKey, 
        subscribedKey
    ],
    queryFn: () => surveyItemsRepository.findAllSubscribed(),
});