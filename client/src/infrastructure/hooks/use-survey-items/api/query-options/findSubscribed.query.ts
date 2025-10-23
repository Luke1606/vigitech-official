import { queryOptions } from '@tanstack/react-query';
import { surveyItemsRepository } from '../../../..';
import { surveyItemsKey, subscribedKey } from '../constants';

export const findSubscribedQueryOptions = () => queryOptions({
    queryKey: [
        surveyItemsKey, 
        subscribedKey
    ],
    queryFn: () => surveyItemsRepository.findAllSubscribed(),
});