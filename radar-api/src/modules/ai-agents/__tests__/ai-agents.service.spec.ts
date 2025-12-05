import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentsService } from '../ai-agents.service';
import { LLMClient } from '../clients/llm-client/llm.client.service';
import { EmbeddingAiClient } from '../clients/embedding-client/embedding.client.service';

describe('AiAgentsService', () => {
    let service: AiAgentsService;
    let geminiFlashAiClient: LLMClient;
    let openAiTextEmbeddingAiClient: EmbeddingAiClient;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiAgentsService,
                {
                    provide: LLMClient,
                    useValue: {
                        generateResponse: jest.fn(),
                    },
                },
                {
                    provide: EmbeddingAiClient,
                    useValue: {
                        generateEmbeddings: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AiAgentsService>(AiAgentsService);
        geminiFlashAiClient = module.get<LLMClient>(LLMClient);
        openAiTextEmbeddingAiClient = module.get<EmbeddingAiClient>(EmbeddingAiClient);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateResponse', () => {
        it('should call multiPurposeClient.generateResponse with the correct arguments', async () => {
            const prompt = 'Hello';
            const context = { key: 'value' };
            const expectedResponse = { text: 'AI response' };

            (geminiFlashAiClient.generateResponse as jest.Mock).mockResolvedValue(expectedResponse);

            const result = await service.generateResponse(prompt, context);

            expect(geminiFlashAiClient.generateResponse).toHaveBeenCalledWith(prompt, context);
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('generateEmbeddings', () => {
        it('should call textEmbeddingClient.generateEmbeddings with the correct arguments', async () => {
            const text = ['text1', 'text2'];
            const expectedEmbeddings = [
                [0.1, 0.2],
                [0.3, 0.4],
            ];

            (openAiTextEmbeddingAiClient.generateEmbeddings as jest.Mock).mockResolvedValue(expectedEmbeddings);

            const result = await service.generateEmbeddings(text);

            expect(openAiTextEmbeddingAiClient.generateEmbeddings).toHaveBeenCalledWith(text);
            expect(result).toEqual(expectedEmbeddings);
        });
    });
});
