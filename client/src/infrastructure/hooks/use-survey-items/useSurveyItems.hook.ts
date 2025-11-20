import { useDispatch, useSelector } from 'react-redux';
import {
	type SurveyItem,
	addToSelectedItems,
	removeFromSelectedItems,
	addPendingSubscribes,
	addPendingUnsubscribes,
	addPendingRemoves,
	clearPendingChanges,
	type AppDispatch,
	type RootState
} from '../..';
import { useSurveyItemsAPI } from './api/useSurveyItemsAPI.hook';

export const useSurveyItems = () => {
	const dispatch = useDispatch<AppDispatch>();
	const selectedItems = useSelector((state: RootState) => state.surveyItems.selectedItems);
	const pendingChanges = useSelector((state: RootState) => state.surveyItems.pendingChanges);

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