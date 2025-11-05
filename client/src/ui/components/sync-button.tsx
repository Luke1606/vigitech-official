import { RotateCw } from 'lucide-react';
import { Button } from '.'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '.';
import { Badge } from '.';
import { useUserItemLists } from '../../infrastructure';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function SyncButton() {
    const {
        retryPendingChanges,
        pendingChanges,
        synchronized
    } = useUserItemLists();

    const [isSyncing, setIsSyncing] = useState(false);

    const totalPending =
        pendingChanges.toCreateList.length +
        pendingChanges.toUpdateList.length +
        pendingChanges.toRemoveList.length +
        pendingChanges.toAppendAllItems.length +
        pendingChanges.toRemoveAllItems.length;

    const handleSync = async () => {
        if (totalPending === 0 || isSyncing) return;

        setIsSyncing(true);

        try {
            const results = await retryPendingChanges();

            const successCount = results.successes?.length || 0;
            const failureCount = results.failures?.length || 0;

            // Mostrar notificación basada en los resultados
            if (failureCount > 0) {
                if (successCount > 0) {
                    // Sincronización parcial (al menos una exitosa)
                    toast.warning(`Sincronización parcial: ${successCount} exitosas, ${failureCount} fallidas`, {
                        position: "top-right",
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    // Todas las sincronizaciones fallaron
                    toast.error(`Sincronización fallida: ${successCount} exitosas, ${failureCount} fallidas`, {
                        position: "top-right",
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else if (successCount > 0) {
                // Sincronización completa exitosa
                toast.success(`Sincronización completada: ${successCount} exitosas, ${failureCount} fallidas`, {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                });
            } else {
                // No había nada que sincronizar
                toast.info('No hay cambios pendientes para sincronizar');
            }
        } catch (error) {
            // Error general en el proceso
            console.error('Error durante la sincronización:', error);
            toast.error('Error crítico durante la sincronización', {
                position: "top-right",
                autoClose: 8000,
            });
        } finally {
            setIsSyncing(false);
        }
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
                            transition-all
                            duration-300
                            ${isSyncing
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : synchronized
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-amber-500 hover:bg-amber-600'
                            }
                        `}
                        disabled={totalPending === 0 || isSyncing}
                    >
                        <div className={isSyncing ? 'animate-spin' : ''}>
                            <RotateCw size={20} color="white" />
                        </div>

                        {totalPending > 0 && !isSyncing && (
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

                        {isSyncing && (
                            <div className="absolute -top-1 -right-1">
                                <div className="h-3 w-3">
                                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                                    <div className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></div>
                                </div>
                            </div>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] p-3">
                    {/* ... tu contenido existente del tooltip ... */}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}