import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingAiClient } from './embedding.client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// Mock del SDK de Google
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockImplementation(() => ({
                batchEmbedContents: jest.fn(),
            })),
        })),
    };
});

describe('EmbeddingAiClient', () => {
    let client: EmbeddingAiClient;
    let modelInstance: any;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'EMBEDDING_API_KEY') return 'test-key';
            if (key === 'EMBEDDING_MODEL') return 'text-embedding-004';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmbeddingAiClient,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: HttpService, useValue: {} },
            ],
        }).compile();

        client = module.get<EmbeddingAiClient>(EmbeddingAiClient);
        modelInstance = (client as any).embeddingModel;
    });

    it('should be defined', () => {
        expect(client).toBeDefined();
    });

    it('should throw error if config is missing', () => {
        const incompleteConfig = { get: jest.fn().mockReturnValue(null) };
        expect(() => new EmbeddingAiClient({} as any, incompleteConfig as any)).toThrow(
            'Embedding API key or embedding model not found.',
        );
    });

    describe('generateEmbeddings', () => {
        it('should return mapped embeddings on success', async () => {
            const input = ['hello', 'world'];
            const mockResult = {
                embeddings: [{ values: [0.1, 0.2] }, { values: [0.3, 0.4] }],
            };

            modelInstance.batchEmbedContents.mockResolvedValue(mockResult);

            const result = await client.generateEmbeddings(input);

            expect(modelInstance.batchEmbedContents).toHaveBeenCalledWith({
                requests: [
                    { content: { role: 'user', parts: [{ text: 'hello' }] } },
                    { content: { role: 'user', parts: [{ text: 'world' }] } },
                ],
            });
            expect(result).toEqual([
                [0.1, 0.2],
                [0.3, 0.4],
            ]);
        });

        it('should throw a custom error message on failure', async () => {
            modelInstance.batchEmbedContents.mockRejectedValue(new Error('SDK Error'));

            await expect(client.generateEmbeddings(['test'])).rejects.toThrow(
                'Falló la generación de embeddings. Revisa tu clave y modelo.',
            );
        });
    });
});
