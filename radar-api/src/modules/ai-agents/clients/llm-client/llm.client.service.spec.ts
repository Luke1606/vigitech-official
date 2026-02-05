import { Test, TestingModule } from '@nestjs/testing';
import { LLMClient } from './llm.client.service';
import { ConfigService } from '@nestjs/config';

describe('LLMClient', () => {
    let client: LLMClient;

    // Mock del SDK de Google
    const mockModel = {
        generateContent: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'LLM_API_KEY') return 'test-api-key';
            if (key === 'LLM_MODEL') return 'gemini-1.5-flash';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LLMClient, { provide: ConfigService, useValue: mockConfigService }],
        }).compile();

        client = module.get<LLMClient>(LLMClient);

        // Inyectamos el mock del modelo manualmente porque se crea en OnModuleInit
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any).model = mockModel;
    });

    it('should be defined', () => {
        expect(client).toBeDefined();
    });

    describe('generateResponse', () => {
        it('should return parsed JSON on success', async () => {
            const mockResponse = {
                response: {
                    text: () => JSON.stringify({ result: 'success' }),
                },
            };
            mockModel.generateContent.mockResolvedValue(mockResponse);

            const result = await client.generateResponse('prompt');

            expect(result).toEqual({ result: 'success' });
            expect(mockModel.generateContent).toHaveBeenCalled();
        });

        it('should return plain text if JSON parsing fails', async () => {
            const mockResponse = {
                response: {
                    text: () => 'Not a JSON',
                },
            };
            mockModel.generateContent.mockResolvedValue(mockResponse);

            const result = await client.generateResponse('prompt');
            expect(result).toBe('Not a JSON');
        });

        it('should throw error if model returns empty', async () => {
            mockModel.generateContent.mockResolvedValue({
                response: { text: () => '' },
            });

            await expect(client.generateResponse('prompt')).rejects.toThrow('El modelo devolvió una respuesta vacía.');
        });
    });
});
