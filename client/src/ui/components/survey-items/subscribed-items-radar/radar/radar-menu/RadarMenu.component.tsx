import type { SurveyItem } from '../../../../../../infrastructure';
import { Button } from "../../../../shared";
import { Maximize, Trash2, Minus } from 'lucide-react';

interface RadarMenuProps {
    item: SurveyItem;
    position: { x: number; y: number };
    onViewDetails: (item: SurveyItem) => void;
    onUnsubscribe: (item: SurveyItem) => void;
    onRemove: (item: SurveyItem) => void;
    onSelect: (item: SurveyItem) => void;
    onUnselect: (item: SurveyItem) => void;
    isSelected: boolean;
}

export const RadarMenu: React.FC<RadarMenuProps> = ({
	item,
	position,
	onViewDetails,
	onUnsubscribe,
	onRemove,
	onSelect,
	onUnselect,
	isSelected
}) => {
	return (
		<div 
			className="fixed z-50 bg-background border rounded-lg shadow-lg p-2 min-w-[200px]"
			style={{ left: position.x, top: position.y }}>
			<div className="space-y-1">
				<Button 
					variant="ghost" 
					className="w-full justify-start" 
					onClick={() => onViewDetails(item)}>
					<Maximize className="h-4 w-4 mr-2" />
					Ver detalles
				</Button>
				
				<Button 
					variant="ghost" 
					className="w-full justify-start" 
					onClick={() => onUnsubscribe(item)}>
					<Minus className="h-4 w-4 mr-2" />
					Dejar de seguir
				</Button>
				
				<Button 
					variant="ghost" 
					className="w-full justify-start"
					onClick={() => {
						if (isSelected)
							onUnselect(item);
						else
							onSelect(item);
						}
					}>
					{isSelected ? 'Deseleccionar' : 'Seleccionar'}
				</Button>
				
				<Button 
					variant="ghost" 
					className="w-full justify-start text-destructive" 
					onClick={() => onRemove(item)}>
					<Trash2 className="h-4 w-4 mr-2" />
					Eliminar
				</Button>
			</div>
		</div>
	);
};