import { useDispatch, useSelector } from 'react-redux';
import { 
	type SurveyItemsState,
	type SurveyItemDto,
	addToSelectedItems,
	removeFromSelectedItems,
	addPendingSubscribes,
	addPendingUnsubscribes,
    addPendingRemoves,
    clearPendingChanges
} from '@/infrastructure';
import { useSurveyItems } from './useSurveyItems.hook';

export const useSurveyItemsUI = () => {
	const dispatch = useDispatch();
	const selectedItems = useSelector((state: SurveyItemsState) => state.selectedItems);
	const pendingChanges = useSelector((state: SurveyItemsState) => state.pendingChanges);
	const query = useSurveyItems();

	return {
		...query,
		selectedItems,
		pendingChanges,
		
		addToSelectedItems: (
			items: SurveyItemDto[]
		) => dispatch(
			addToSelectedItems(items)
		),

		removeFromSelectedItems: (
			items: SurveyItemDto[]
		) => dispatch(
			removeFromSelectedItems(items)
		),
		
		addPendingSubscribes: (
			items: SurveyItemDto[]
		) => dispatch(
			addPendingSubscribes(items)
		),
		
		addPendingUnsubscribes: (
			items: SurveyItemDto[]
		) => dispatch(
			addPendingUnsubscribes(items)
		),

		addPendingRemoves: (
			items: SurveyItemDto[]
		) => dispatch(
			addPendingRemoves(items)
		),
		
		clearPendingChanges: () => dispatch(
			clearPendingChanges()
		)
	};
};

