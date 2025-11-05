import { Rotate3D } from 'lucide-react';
import { Button } from '.'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '.';
import { Badge } from '.';
import { useUserItemLists } from '../../infrastructure';

export function SyncButton() {
    const {
        retryPendingChanges,
        pendingChanges,
        synchronized
    } = useUserItemLists();

    // Calcular el total de cambios pendientes
    const totalPending =
        pendingChanges.toCreateList.length +
        pendingChanges.toUpdateList.length +
        pendingChanges.toRemoveList.length +
        pendingChanges.toAppendAllItems.length +
        pendingChanges.toRemoveAllItems.length;

    // Función para manejar la sincronización
    const handleSync = async () => {
        if (totalPending === 0) return;

        try {
            await retryPendingChanges({ maxRetries: 3 });
        } catch (error) {
            console.error('Error durante la sincronización:', error);
        }
    };

    // Contenido del tooltip con desglose detallado
    const getTooltipContent = () => {
        if (synchronized) {
            return "Todo sincronizado con el servidor";
        }

        if (totalPending === 0) {
            return "No hay cambios pendientes";
        }

        return (
            <div className="space-y-2">
                <span className="font-semibold text-sm">{totalPending} cambios pendientes</span>
                <div className="grid grid-cols-1 gap-1 text-xs">
                    {pendingChanges.toCreateList.length > 0 && (
                        <div className="flex justify-between">
                            <span>📝 Creaciones:</span>
                            <span className="font-medium ml-2">{pendingChanges.toCreateList.length}</span>
                        </div>
                    )}
                    {pendingChanges.toUpdateList.length > 0 && (
                        <div className="flex justify-between">
                            <span>✏️ Actualizaciones:</span>
                            <span className="font-medium ml-2">{pendingChanges.toUpdateList.length}</span>
                        </div>
                    )}
                    {pendingChanges.toRemoveList.length > 0 && (
                        <div className="flex justify-between">
                            <span>🗑️ Eliminaciones:</span>
                            <span className="font-medium ml-2">{pendingChanges.toRemoveList.length}</span>
                        </div>
                    )}
                    {pendingChanges.toAppendAllItems.length > 0 && (
                        <div className="flex justify-between">
                            <span>📥 Agregar items:</span>
                            <span className="font-medium ml-2">{pendingChanges.toAppendAllItems.length}</span>
                        </div>
                    )}
                    {pendingChanges.toRemoveAllItems.length > 0 && (
                        <div className="flex justify-between">
                            <span>📤 Remover items:</span>
                            <span className="font-medium ml-2">{pendingChanges.toRemoveAllItems.length}</span>
                        </div>
                    )}
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                    Click para sincronizar
                </div>
            </div>
        );
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleSync}
                        size="sm"
                        className={`
              relative 
              ${synchronized
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-amber-500 hover:bg-amber-600'
                            }
            `}
                        disabled={totalPending === 0}
                    >
                        <Rotate3D size={20} color="white" />

                        {/* Badge con contador de cambios pendientes */}
                        {totalPending > 0 && (
                            <Badge
                                variant="destructive"
                                className="
                  absolute 
                  -top-2 
                  -right-2 
                  h-5 
                  w-5 
                  flex 
                  items-center 
                  justify-center 
                  p-0 
                  text-xs 
                  min-w-0
                  border-2 
                  border-white
                "
                            >
                                {totalPending}
                            </Badge>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] p-3">
                    {getTooltipContent()}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}