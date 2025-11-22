import { Maximize, Trash2, Minus } from 'lucide-react';
import type { SurveyItem } from '../../../../../../infrastructure';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '../../../../shared';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../../../../shared'; // Ajusta la ruta según tu estructura
import React from 'react';

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
	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleClose = () => {
		// Simular clic fuera para cerrar
		const event = new MouseEvent('click', { bubbles: true });
		document.dispatchEvent(event);
	};

	// Para móvil, usamos el Dialog de shadcn
	if (isMobile) {
		return (
			<Dialog open={true} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Opciones del elemento</DialogTitle>
						<DialogDescription>
							Selecciona una acción para {item.title}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-1">
						<button
							onClick={() => {
								onViewDetails(item);
								handleClose();
							}}
							className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Maximize className="mr-2 h-4 w-4" />
							Ver detalles
						</button>

						<button
							onClick={() => {
								onUnsubscribe([item]);
								handleClose();
							}}
							className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Minus className="mr-2 h-4 w-4" />
							Dejar de seguir
						</button>

						<button
							onClick={() => {
								isSelected ? onUnselect(item) : onSelect(item);
								handleClose();
							}}
							className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							{isSelected ? 'Deseleccionar' : 'Seleccionar'}
						</button>

						<div className="my-1 border-t" />

						<button
							onClick={() => {
								onRemove([item]);
								handleClose();
							}}
							className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar
						</button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// Para desktop, usamos el DropdownMenu original
	return (
		<DropdownMenu open={true} onOpenChange={() => { }}>
			<DropdownMenuContent
				className="w-56"
				style={{
					position: 'fixed',
					left: Math.min(position.x, window.innerWidth - 224),
					top: Math.min(position.y, window.innerHeight - 200)
				}}
				forceMount
			>
				<DropdownMenuItem onClick={() => onViewDetails(item)}>
					<Maximize className="mr-2 h-4 w-4" />
					Ver detalles
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onUnsubscribe([item])}>
					<Minus className="mr-2 h-4 w-4" />
					Dejar de seguir
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => isSelected ? onUnselect(item) : onSelect(item)}>
					{isSelected ? 'Deseleccionar' : 'Seleccionar'}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => onRemove([item])} className="text-destructive">
					<Trash2 className="mr-2 h-4 w-4" />
					Eliminar
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};