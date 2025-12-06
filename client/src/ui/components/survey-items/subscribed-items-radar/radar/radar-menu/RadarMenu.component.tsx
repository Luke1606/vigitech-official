import { Maximize, Trash2, Minus, CheckCircle } from 'lucide-react'; // Agregar CheckCircle
import type { SurveyItem, UUID } from '../../../../../../infrastructure';
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
} from '../../../../shared';
import React from 'react';

interface RadarMenuProps {
	item: SurveyItem;
	position: { x: number; y: number };
	onViewDetails: (item: SurveyItem) => void;
	onUnsubscribe: (item: UUID) => void;
	onRemove: (items: SurveyItem[]) => void;
	onSelect: (item: SurveyItem) => void;
	onUnselect: (item: SurveyItem) => void;
	isSelected: boolean;
	selectedCount?: number; // NUEVO: Para mostrar el conteo de seleccionados
}

export const RadarMenu: React.FC<RadarMenuProps> = ({
	item,
	position,
	onViewDetails,
	onUnsubscribe,
	onRemove,
	onSelect,
	onUnselect,
	isSelected,
	selectedCount = 0 // NUEVO: Valor por defecto
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

	// NUEVO: Determinar el texto para "Dejar de seguir"
	const getUnsubscribeText = () => {
		if (selectedCount > 0 && isSelected) {
			return `Dejar de seguir (${selectedCount} seleccionados)`;
		}
		return 'Dejar de seguir (este)';
	};

	// Para móvil, usamos el Dialog de shadcn
	if (isMobile) {
		return (
			<Dialog open={true} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between">
							<span>Opciones del elemento</span>
							{isSelected && (
								<CheckCircle size={16} className="text-green-600" />
							)}
						</DialogTitle>
						<DialogDescription>
							Selecciona una acción para <strong>{item.title}</strong>
							{selectedCount > 0 && isSelected && (
								<span className="block text-green-600 mt-1">
									{selectedCount} elementos seleccionados
								</span>
							)}
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
								// NUEVO: Pasar el ID del item actual al manejador
								onUnsubscribe(item.id);
								handleClose();
							}}
							className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Minus className="mr-2 h-4 w-4" />
							{getUnsubscribeText()}
						</button>

						<button
							onClick={() => {
								isSelected ? onUnselect(item) : onSelect(item);
								handleClose();
							}}
							className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${isSelected ? 'text-green-600' : ''}`}
						>
							{isSelected ? (
								<>
									<CheckCircle className="mr-2 h-4 w-4" />
									Deseleccionar
								</>
							) : (
								'Seleccionar'
							)}
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
				className="w-64"
				style={{
					position: 'fixed',
					left: Math.min(position.x, window.innerWidth - 256),
					top: Math.min(position.y, window.innerHeight - 200)
				}}
				forceMount
			>
				{/* NUEVO: Mostrar información de selección */}
				{selectedCount > 0 && isSelected && (
					<div className="px-2 py-1.5 text-xs text-green-600 bg-green-50 border-b border-green-100">
						<CheckCircle size={12} className="inline mr-1" />
						{selectedCount} elementos seleccionados
					</div>
				)}

				<DropdownMenuItem onClick={() => onViewDetails(item)}>
					<Maximize className="mr-2 h-4 w-4" />
					Ver detalles
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onUnsubscribe(item.id)}>
					<Minus className="mr-2 h-4 w-4" />
					{getUnsubscribeText()}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => isSelected ? onUnselect(item) : onSelect(item)}
					className={isSelected ? 'text-green-600' : ''}
				>
					{isSelected ? (
						<>
							<CheckCircle className="mr-2 h-4 w-4" />
							Deseleccionar
						</>
					) : 'Seleccionar'}
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