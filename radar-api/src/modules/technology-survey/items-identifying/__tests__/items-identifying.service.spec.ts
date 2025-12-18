import { Test, TestingModule } from '@nestjs/testing';
import { ItemsIdentifyingService } from '../items-identifying.service';
import { DataFetchService } from '../../data-fetch/data-fetch.service';
import { ItemsGatewayService } from '../../gateway/gateway.service';
import { AiAgentsService } from '../../../ai-agents/ai-agents.service';
import { Logger } from '@nestjs/common';

describe('ItemsIdentifyingService', () => {
    let service: ItemsIdentifyingService;
    let dataFetchService: DataFetchService;
    let itemsGatewayService: ItemsGatewayService;
    let aiAgentsService: AiAgentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsIdentifyingService,
                {
                    provide: DataFetchService,
                    // IMPORTANTE: Devolver [] por defecto para evitar ".length" de undefined
                    useValue: { fetchDataForTrendAnalysis: jest.fn().mockResolvedValue([]) },
                },
                {
                    provide: ItemsGatewayService,
                    // IMPORTANTE: Devolver [] por defecto para evitar ".map" de undefined
                    useValue: { findAllItemTitles: jest.fn().mockResolvedValue([]), createBatch: jest.fn() },
                },
                {
                    provide: AiAgentsService,
                    useValue: { generateResponse: jest.fn().mockResolvedValue([]) },
                },
            ],
        }).compile();

        service = module.get<ItemsIdentifyingService>(ItemsIdentifyingService);
        dataFetchService = module.get<DataFetchService>(DataFetchService);
        itemsGatewayService = module.get<ItemsGatewayService>(ItemsGatewayService);
        aiAgentsService = module.get<AiAgentsService>(AiAgentsService);

        // Silenciamos logs en el test para limpieza
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('identifyNewItems', () => {
        it('debe identificar y crear nuevos items si la IA devuelve resultados (Camino Feliz)', async () => {
            // GIVEN
            const mockExistingTitles = ['React', 'NestJS'];
            const mockFragments = [{ id: '1', textSnippet: 'Svelte is rising' }];
            const mockAiResponse = [{ title: 'Svelte' }];

            jest.spyOn(itemsGatewayService, 'findAllItemTitles').mockResolvedValue(mockExistingTitles);
            jest.spyOn(dataFetchService, 'fetchDataForTrendAnalysis').mockResolvedValue(mockFragments as any);
            jest.spyOn(aiAgentsService, 'generateResponse').mockResolvedValue(mockAiResponse);

            // WHEN
            await service.identifyNewItems();

            // THEN
            expect(itemsGatewayService.findAllItemTitles).toHaveBeenCalled();
            expect(dataFetchService.fetchDataForTrendAnalysis).toHaveBeenCalled();
            expect(aiAgentsService.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining('"React", "NestJS"'),
                mockFragments,
            );
            expect(itemsGatewayService.createBatch).toHaveBeenCalledWith(mockAiResponse);
        });

        it('no debe llamar a createBatch si la IA no identifica nada (Edge Case: Array Vacío)', async () => {
            // GIVEN
            jest.spyOn(itemsGatewayService, 'findAllItemTitles').mockResolvedValue([]);
            jest.spyOn(dataFetchService, 'fetchDataForTrendAnalysis').mockResolvedValue([]);
            jest.spyOn(aiAgentsService, 'generateResponse').mockResolvedValue([]);

            // WHEN
            await service.identifyNewItems();

            // THEN
            expect(itemsGatewayService.createBatch).not.toHaveBeenCalled();
        });

        it('debe manejar correctamente cuando no hay títulos existentes (Edge Case: RAG Negativo vacío)', async () => {
            // GIVEN
            const mockFragments = [{ id: '1', textSnippet: 'New Tech' }];
            jest.spyOn(itemsGatewayService, 'findAllItemTitles').mockResolvedValue([]);
            jest.spyOn(dataFetchService, 'fetchDataForTrendAnalysis').mockResolvedValue(mockFragments as any);
            jest.spyOn(aiAgentsService, 'generateResponse').mockResolvedValue([{ title: 'New Tech' }]);

            // WHEN
            await service.identifyNewItems();

            // THEN
            // Verificamos que el prompt se construya aunque la lista de títulos esté vacía
            expect(aiAgentsService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('[]'), mockFragments);
            expect(itemsGatewayService.createBatch).toHaveBeenCalled();
        });
    });
});
