import { useDispatch, useSelector } from 'react-redux';
import {
	type SurveyItem,
	addToSurveyItems,
	setSurveyItems,
	removeFromSurveyItems,
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
	const surveyItems = useSelector((state: RootState) => state.surveyItems.surveyItems);
	const pendingChanges = useSelector((state: RootState) => state.surveyItems.pendingChanges);

	const query = useSurveyItemsAPI();

	return {
		...query,
		surveyItems,
		pendingChanges,

		addToSurveyItems: (
			items: SurveyItem[]
		) => dispatch(
			addToSurveyItems(items)
		),

		setSurveyItems: (
			items: SurveyItem[]
		) => dispatch(
			setSurveyItems(items)
		),

		removeFromSurveyItems: (
			items: SurveyItem[]
		) => dispatch(
			removeFromSurveyItems(items)
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