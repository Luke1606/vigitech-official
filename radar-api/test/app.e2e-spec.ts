import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AiAgentsService } from '../src/modules/ai-agents/ai-agents.service';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });

    describe('/ai-agents', () => {
        const mockResponse = {
            candidates: [
                {
                    content: {
                        parts: [{ text: 'Mocked AI response' }],
                    },
                },
            ],
        };
        const mockEmbeddings = [[0.1, 0.2, 0.3]];

        it('/generate-response (POST) should return a mocked AI response', async () => {
            const aiAgentsService = app.get(AiAgentsService);
            jest.spyOn(aiAgentsService, 'generateResponse').mockResolvedValue(mockResponse);

            return request(app.getHttpServer())
                .post('/ai-agents/generate-response')
                .send({ prompt: 'test prompt', context: { data: 'test data' } })
                .expect(201)
                .expect(mockResponse);
        });

        it('/generate-embeddings (POST) should return mocked embeddings', async () => {
            const aiAgentsService = app.get(AiAgentsService);
            jest.spyOn(aiAgentsService, 'generateEmbeddings').mockResolvedValue(mockEmbeddings);

            return request(app.getHttpServer())
                .post('/ai-agents/generate-embeddings')
                .send({ text: ['test text'] })
                .expect(201)
                .expect(mockEmbeddings);
        });
    });
});
