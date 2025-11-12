import { Maximize, Trash2, Minus } from 'lucide-react';
import type { SurveyItem } from '../../../../../../infrastructure';
import { Button } from "../../../../shared";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '../../../../shared';
interface RadarMenuProps {
	item: SurveyItem;
	position: { x: number; y: number };
	onViewDetails: (item: SurveyItem) => void;
	onUnsubscribe: (items: SurveyItem[]) => void;
	onRemove: (items: SurveyItem[]) => void;
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
		<DropdownMenu open={true} onOpenChange={() => { }}>
			<DropdownMenuContent
				className="w-56"
				style={{ position: 'fixed', left: position.x, top: position.y }}
				forceMount
			>
				<DropdownMenuItem onClick={() => onViewDetails(item)}>
					<Maximize className="h-4 w-4 mr-2" />
					Ver detalles
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onUnsubscribe([item])}>
					<Minus className="h-4 w-4 mr-2" />
					Dejar de seguir
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => isSelected ? onUnselect(item) : onSelect(item)}>
					{isSelected ? 'Deseleccionar' : 'Seleccionar'}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => onRemove([item])} className="text-destructive">
					<Trash2 className="h-4 w-4 mr-2" />
					Eliminar
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};