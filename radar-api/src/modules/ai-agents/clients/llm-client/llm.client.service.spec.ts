import { Test, TestingModule } from '@nestjs/testing';
import { LLMClient } from './llm.client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('LLMClient', () => {
    let client: LLMClient;
    let httpService: HttpService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'LLM_API_KEY') return 'test-api-key';
            if (key === 'LLM_MODEL') return 'gemini-1.5-flash';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LLMClient,
                { provide: ConfigService, useValue: mockConfigService },
                {
                    provide: HttpService,
                    useValue: {
                        post: jest.fn(),
                    },
                },
            ],
        }).compile();

        client = module.get<LLMClient>(LLMClient);
        httpService = module.get<HttpService>(HttpService);
    });

    it('should be defined', () => {
        expect(client).toBeDefined();
    });

    it('should throw error if API key is missing', () => {
        const incompleteConfig = { get: jest.fn().mockReturnValue(null) };
        expect(() => new LLMClient(httpService, incompleteConfig as any)).toThrow('LLM API key not found.');
    });

    describe('generateResponse', () => {
        it('should return data on successful API call', async () => {
            const prompt = 'Test prompt';
            const context = { data: 'test context' };
            const axiosResponse: Partial<AxiosResponse> = {
                data: { candidates: [{ content: { parts: [{ text: 'AI Response' }] } }] },
            };

            jest.spyOn(httpService, 'post').mockReturnValue(of(axiosResponse as AxiosResponse));

            const result = await client.generateResponse(prompt, context);

            expect(httpService.post).toHaveBeenCalled();
            expect(result).toEqual(axiosResponse.data);
        });

        it('should log and throw error on API failure', async () => {
            const prompt = 'Test prompt';
            jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('API Error')));

            await expect(client.generateResponse(prompt)).rejects.toThrow('API Error');
        });
        it('should throw error if LLM_API_KEY is missing', () => {
            mockConfigService.get.mockImplementation((key) => {
                if (key === 'LLM_API_KEY') return undefined;
                return 'test';
            });
            expect(() => new LLMClient(httpService, mockConfigService as any)).toThrow('LLM API key not found.');
        });
    });
});
