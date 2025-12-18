import { Test, TestingModule } from '@nestjs/testing';
import { OrchestrationService } from '../orchestration.service';
import { ItemsIdentifyingService } from '../../items-identifying/items-identifying.service';
import { ItemsGatewayService } from '../../gateway/gateway.service';
import { UserPreferencesService } from '../../../user-data/user-preferences/user-preferences.service';

describe('OrchestrationService', () => {
    let service: OrchestrationService;
    let identifyingService: ItemsIdentifyingService;
    let gatewayService: ItemsGatewayService;
    let userPrefsService: UserPreferencesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrchestrationService,
                {
                    provide: ItemsIdentifyingService,
                    useValue: { identifyNewItems: jest.fn() },
                },
                {
                    provide: ItemsGatewayService,
                    useValue: { findAllRecommended: jest.fn(), reclassifySubscribedItems: jest.fn() },
                },
                {
                    provide: UserPreferencesService,
                    useValue: { findAllPreferences: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<OrchestrationService>(OrchestrationService);
        identifyingService = module.get<ItemsIdentifyingService>(ItemsIdentifyingService);
        gatewayService = module.get<ItemsGatewayService>(ItemsGatewayService);
        userPrefsService = module.get<UserPreferencesService>(UserPreferencesService);
    });

    describe('runGlobalRecommendationJob', () => {
        it('debe llamar secuencialmente a identificación y luego a búsqueda', async () => {
            const userId = 'user-uuid' as any;
            const mockItems = [{ id: '1' }];

            identifyingService.identifyNewItems = jest.fn().mockResolvedValue(undefined);
            gatewayService.findAllRecommended = jest.fn().mockResolvedValue(mockItems);

            const result = await service.runGlobalRecommendationJob(userId);

            expect(identifyingService.identifyNewItems).toHaveBeenCalled();
            expect(gatewayService.findAllRecommended).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockItems);
        });
    });

    describe('runAllReclassifications', () => {
        it('debe procesar múltiples usuarios y desduplicar cambios de items', async () => {
            const mockUsers = [{ userId: 'u1' }, { userId: 'u2' }];
            userPrefsService.findAllPreferences = jest.fn().mockResolvedValue(mockUsers);

            // Simular que ambos usuarios tienen el mismo item suscrito y este cambia
            const change = { itemId: 'same-item-id', classification: 'TEST' };
            gatewayService.reclassifySubscribedItems = jest.fn().mockResolvedValue([change]);

            const result = await service.runAllReclassifications();

            // Debe ejecutarse para cada usuario
            expect(gatewayService.reclassifySubscribedItems).toHaveBeenCalledTimes(2);

            // Pero el resultado final debe estar desduplicado por el Map
            expect(result).toHaveLength(1);
            expect(result[0].itemId).toBe('same-item-id');
        });

        it('debe manejar una lista de preferencias vacía', async () => {
            userPrefsService.findAllPreferences = jest.fn().mockResolvedValue([]);
            const result = await service.runAllReclassifications();
            expect(result).toEqual([]);
        });
    });
});
