import { useDispatch, useSelector } from 'react-redux';
import { 
	type SurveyItemsState,
	type SurveyItem,
	addToSelectedItems,
	removeFromSelectedItems,
	addPendingSubscribes,
	addPendingUnsubscribes,
    addPendingRemoves,
    clearPendingChanges
} from '@/infrastructure';
import { useSurveyItemsAPI } from './api/useSurveyItemsAPI.hook';

export const useSurveyItems = () => {
	const dispatch = useDispatch();
	const selectedItems = useSelector((state: SurveyItemsState) => state.selectedItems);
	const pendingChanges = useSelector((state: SurveyItemsState) => state.pendingChanges);
	
	const query = useSurveyItemsAPI();

	return {
		...query,
		selectedItems,
		pendingChanges,
		
		addToSelectedItems: (
			items: SurveyItem[]
		) => dispatch(
			addToSelectedItems(items)
		),

		removeFromSelectedItems: (
			items: SurveyItem[]
		) => dispatch(
			removeFromSelectedItems(items)
		),
		
		addPendingSubscribes: (
			items: SurveyItem[]
		) => dispatch(
			addPendingSubscribes(items)
		),
		
		addPendingUnsubscribes: (
			items: SurveyItem[]
		) => dispatch(
			addPendingUnsubscribes(items)
		),

		addPendingRemoves: (
			items: SurveyItem[]
		) => dispatch(
			addPendingRemoves(items)
		),
		
		clearPendingChanges: () => dispatch(
			clearPendingChanges()
		)
	};
};