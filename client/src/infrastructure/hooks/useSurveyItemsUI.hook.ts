import { useDispatch, useSelector } from 'react-redux';
import { useSurveyItems } from './';
import { setSelectedItem, type SurveyItemDto } from '@/infrastructure';

export const useSurveyItemsUI = () => {
  const dispatch = useDispatch();
  const selectedItem = useSelector((state) => state.surveyItems.selectedItem);
  const query = useSurveyItems();

  return {
    selectedItem,
    setSelectedItem: (item: SurveyItemDto) => dispatch(setSelectedItem(item)),
    ...query,
  };
};

