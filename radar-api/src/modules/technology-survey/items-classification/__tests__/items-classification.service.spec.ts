import { Test, TestingModule } from '@nestjs/testing';
import { ItemsClassificationService } from '../items-classification.service';
import { DataFetchService } from '../../data-fetch/data-fetch.service';
import { AiAgentsService } from '../../../ai-agents/ai-agents.service';

describe('ItemsClassificationService', () => {
    let service: ItemsClassificationService;
    let aiService: AiAgentsService;
    let dataService: DataFetchService;

    const mockFragment = { id: 'frag-1', textSnippet: 'Evidence 1' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemsClassificationService,
                {
                    provide: DataFetchService,
                    useValue: {
                        fetchItemDataForClassification: jest.fn(),
                        fetchItemDataForReclassification: jest.fn(),
                    },
                },
                { provide: AiAgentsService, useValue: { generateResponse: jest.fn() } },
            ],
        }).compile();

        service = module.get<ItemsClassificationService>(ItemsClassificationService);
        aiService = module.get<AiAgentsService>(AiAgentsService);
        dataService = module.get<DataFetchService>(DataFetchService);
    });

    describe('classifyNewItem', () => {
        it('debe mapear fragmentos y llamar al LLM con el prompt correcto', async () => {
            const mockDto = { title: 'New Tech' } as any;
            const mockResponse = { classification: 'ADOPT' };

            (dataService.fetchItemDataForClassification as jest.Mock).mockResolvedValue([mockFragment]);
            (aiService.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

            const result = await service.classifyNewItem(mockDto);

            expect(aiService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('---FRAGMENT ID: frag-1'), [
                mockFragment,
            ]);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('classifyNewBatch', () => {
        it('debe procesar un array de items concurrentemente', async () => {
            const items = [{ title: 'T1' }, { title: 'T2' }] as any;
            jest.spyOn(service, 'classifyNewItem').mockResolvedValue({ classification: 'TEST' } as any);

            const results = await service.classifyNewBatch(items);

            expect(service.classifyNewItem).toHaveBeenCalledTimes(2);
            expect(results.length).toBe(2);
        });

        it('debe manejar un batch vacío sin errores', async () => {
            const results = await service.classifyNewBatch([]);
            expect(results).toEqual([]);
        });
    });

    describe('classifyExistentItem (Coverage for Lines 142-146)', () => {
        it('debe usar "TEST" como fallback si no hay clasificación previa (Rama Line 142)', async () => {
            const mockItem = {
                title: 'No Class Tech',
                latestClassification: null, // Forzamos el fallback || 'TEST'
            } as any;

            (dataService.fetchItemDataForReclassification as jest.Mock).mockResolvedValue([]);
            (aiService.generateResponse as jest.Mock).mockResolvedValue({ classification: 'HOLD' });

            await service.classifyExistentItem(mockItem);

            expect(aiService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('Anillo Actual: TEST'), []);
        });

        it('debe incluir la clasificación actual en el prompt si existe', async () => {
            const mockItem = {
                title: 'Old Tech',
                latestClassification: { classification: 'SUSTAIN' },
            } as any;

            (dataService.fetchItemDataForReclassification as jest.Mock).mockResolvedValue([mockFragment]);
            (aiService.generateResponse as jest.Mock).mockResolvedValue({ classification: 'ADOPT' });

            await service.classifyExistentItem(mockItem);

            expect(aiService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('Anillo Actual: SUSTAIN'), [
                mockFragment,
            ]);
        });
    });

    describe('classifyExistentBatch', () => {
        it('debe procesar múltiples items existentes concurrentemente', async () => {
            const items = [{ title: 'E1' }, { title: 'E2' }] as any;
            jest.spyOn(service, 'classifyExistentItem').mockResolvedValue({ classification: 'HOLD' } as any);

            const results = await service.classifyExistentBatch(items);

            expect(service.classifyExistentItem).toHaveBeenCalledTimes(2);
            expect(results.length).toBe(2);
        });
    });
});
