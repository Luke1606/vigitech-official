import { useDispatch, useSelector } from 'react-redux';
import { 
	type SurveyItemsState,
	type SurveyItem,
	type ChangeLogEntry,
	addToSelectedItems,
	removeFromSelectedItems,
	addChangeLog,
	clearChangeLog,
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
	const changeLogs = useSelector((state: SurveyItemsState) => state.changeLogs);
	const query = useSurveyItems();

	return {
		...query,
		selectedItems,
		pendingChanges,
		changeLogs,
		
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

		addChangeLog: (
			changeLog: ChangeLogEntry
		) => dispatch(
			addChangeLog(changeLog)
		),

		clearChangeLog: () => dispatch(clearChangeLog()),
		
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