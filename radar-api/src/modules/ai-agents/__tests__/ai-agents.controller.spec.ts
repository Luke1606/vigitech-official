import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentsController } from '../ai-agents.controller';
import { AiAgentsService } from '../ai-agents.service';
import { GenerateResponseDto } from '../dto/generate-response.dto';
import { GenerateEmbeddingsDto } from '../dto/generate-embeddings.dto';

describe('AiAgentsController', () => {
    let controller: AiAgentsController;
    let service: AiAgentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AiAgentsController],
            providers: [
                {
                    provide: AiAgentsService,
                    useValue: {
                        generateResponse: jest.fn(),
                        generateEmbeddings: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AiAgentsController>(AiAgentsController);
        service = module.get<AiAgentsService>(AiAgentsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('generateResponse', () => {
        it('should call service.generateResponse and return the result', async () => {
            const dto: GenerateResponseDto = { prompt: 'Hello', context: {} };
            const expectedResult = { text: 'AI Response' };
            jest.spyOn(service, 'generateResponse').mockResolvedValue(expectedResult);

            const result = await controller.generateResponse(dto);

            expect(service.generateResponse).toHaveBeenCalledWith(dto.prompt, dto.context);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('generateEmbeddings', () => {
        it('should call service.generateEmbeddings and return the result', async () => {
            const dto: GenerateEmbeddingsDto = { text: ['text1', 'text2'] };
            const expectedResult = [
                [0.1, 0.2],
                [0.3, 0.4],
            ];
            jest.spyOn(service, 'generateEmbeddings').mockResolvedValue(expectedResult);

            const result = await controller.generateEmbeddings(dto);

            expect(service.generateEmbeddings).toHaveBeenCalledWith(dto.text);
            expect(result).toEqual(expectedResult);
        });
    });
});
