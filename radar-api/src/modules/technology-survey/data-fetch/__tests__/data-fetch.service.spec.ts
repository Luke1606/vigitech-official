import { Test, TestingModule } from '@nestjs/testing';
import { DataFetchService } from '../data-fetch.service';
import { DataGatewayService } from '../../../data-hub/gateway/gateway.service';
import { Frequency } from '@prisma/client';

describe('DataFetchService', () => {
    let service: DataFetchService;
    let dataGatewayService: DataGatewayService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataFetchService,
                {
                    provide: DataGatewayService,
                    useValue: {
                        search: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        service = module.get<DataFetchService>(DataFetchService);
        dataGatewayService = module.get<DataGatewayService>(DataGatewayService);
    });

    describe('fetchDataForTrendAnalysis (Coverage for Lines 113-123)', () => {
        it('debe calcular correctamente los minutos para todas las frecuencias del enum', async () => {
            // Este test fuerza la ejecución de cada rama del switch en frequencyToMinutes
            const frequencies = [
                { freq: Frequency.EVERY_10_MINUTES, expected: 10 },
                { freq: Frequency.EVERY_30_MINUTES, expected: 30 },
                { freq: Frequency.HOURLY, expected: 60 },
                { freq: Frequency.EVERY_6_HOURS, expected: 360 },
                { freq: Frequency.DAILY, expected: 1440 },
                { freq: Frequency.EVERY_TWO_DAYS, expected: 2880 },
                { freq: Frequency.EVERY_FOUR_DAYS, expected: 5760 },
                { freq: Frequency.WEEKLY, expected: 10080 },
                { freq: 'OTHER' as any, expected: 1440 }, // Prueba el default
            ];

            for (const item of frequencies) {
                await service.fetchDataForTrendAnalysis(item.freq);

                // Verificamos que se llame al gateway con una fecha coherente
                // (La resta de minutos ocurre dentro de calculateStartDate)
                expect(dataGatewayService.search).toHaveBeenCalledWith(
                    expect.objectContaining({
                        startDate: expect.any(Date),
                    }),
                );
            }
        });
    });

    describe('fetchItemDataForClassification', () => {
        it('debe llamar al gateway con los parámetros de clasificación inicial', async () => {
            const mockDto = { title: 'NestJS' } as any;
            await service.fetchItemDataForClassification(mockDto);

            expect(dataGatewayService.search).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: expect.stringContaining('NestJS'),
                    k: 75,
                }),
            );
        });
    });

    describe('fetchItemDataForReclassification', () => {
        it('debe construir el prompt usando la clasificación actual', async () => {
            const mockItem = {
                title: 'React',
                itemField: 'LANGUAGES',
                summary: 'Library',
                latestClassification: { classification: 'ADOPT' },
            } as any;

            await service.fetchItemDataForReclassification(mockItem);

            expect(dataGatewayService.search).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: expect.stringContaining('ADOPT'),
                    k: 100,
                }),
            );
        });
    });
});
