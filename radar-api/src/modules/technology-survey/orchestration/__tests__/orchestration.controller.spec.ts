import { Test, TestingModule } from '@nestjs/testing';
import { OrchestrationController } from '../orchestration.controller';
import { OrchestrationService } from '../orchestration.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('OrchestrationController', () => {
    let controller: OrchestrationController;
    let service: OrchestrationService;

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrchestrationController],
            providers: [
                {
                    provide: OrchestrationService,
                    useValue: {
                        runGlobalRecommendationJob: jest.fn(),
                        runAllReclassifications: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<OrchestrationController>(OrchestrationController);
        service = module.get<OrchestrationService>(OrchestrationService);
    });

    describe('runGlobalRecommendations', () => {
        const mockReq = { userId: '550e8400-e29b-41d4-a716-446655440000' } as any;

        it('debe retornar 200 y los datos cuando el proceso es exitoso', async () => {
            const mockItems = [{ id: '1', title: 'Tech' }];
            jest.spyOn(service, 'runGlobalRecommendationJob').mockResolvedValue(mockItems as any);

            await controller.runGlobalRecommendations(mockReq, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: expect.stringContaining('Found 1 total recommendations'),
                data: mockItems,
            });
        });

        it('debe retornar 500 cuando el servicio lanza una excepción', async () => {
            const error = new Error('Async Error');
            jest.spyOn(service, 'runGlobalRecommendationJob').mockRejectedValue(error);

            await controller.runGlobalRecommendations(mockReq, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Failed to initiate global recommendation process.',
                error: error.message,
            });
        });
    });

    describe('runAllReclassifications', () => {
        it('debe retornar 200 y los cambios realizados', async () => {
            const mockChanges = [{ itemId: 'item-1', classification: 'ADOPT' }];
            jest.spyOn(service, 'runAllReclassifications').mockResolvedValue(mockChanges as any);

            await controller.runAllReclassifications(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockChanges }));
        });

        it('debe manejar errores en la reclasificación general', async () => {
            jest.spyOn(service, 'runAllReclassifications').mockRejectedValue(new Error('Fatal'));

            await controller.runAllReclassifications(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});
