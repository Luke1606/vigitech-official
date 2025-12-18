import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeFragment } from '@prisma/client';
import { DataGatewayController } from '../gateway.controller';
import { DataGatewayService } from '../gateway.service';
import { SearchQueryDto } from '../dto/search-query.dto';

describe('DataGatewayController', () => {
    let controller: DataGatewayController;
    let service: DataGatewayService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DataGatewayController],
            providers: [
                {
                    provide: DataGatewayService,
                    useValue: {
                        search: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<DataGatewayController>(DataGatewayController);
        service = module.get<DataGatewayService>(DataGatewayService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('search', () => {
        it('should call dataGatewayService.search and return the result', async () => {
            const searchQueryDto: SearchQueryDto = {
                query: 'test',
                limit: 10,
                offset: 0,
            };
            const expectedFragments: KnowledgeFragment[] = [
                {
                    id: '1',
                    textSnippet: 'Test snippet',
                    // `embedding` es un tipo Unsupported("vector") en Prisma, por lo que no está directamente en KnowledgeFragment
                    // y debe ser manejado a nivel de base de datos o como `any` en mocks si es estrictamente necesario para el mock
                    associatedKPIs: {},
                    sourceRawDataId: 'raw1',
                    createdAt: new Date(),
                },
            ] as KnowledgeFragment[]; // Casteamos para evitar el error de 'embedding'

            (service.search as jest.Mock).mockResolvedValue(expectedFragments);

            const result = await controller.search(searchQueryDto);

            expect(service.search).toHaveBeenCalledWith(searchQueryDto);
            expect(result).toEqual(expectedFragments);
        });
    });
});
