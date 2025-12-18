import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';
import { ItemsClassificationService } from '../src/modules/technology-survey/items-classification/items-classification.service';
import { CreateUnclassifiedItemDto } from '../src/modules/technology-survey/shared/dto/create-unclassified-item.dto';
import { ItemField, ItemClassificationType } from '@prisma/client';

const USER_ID = 'test-user-uuid';

describe('ItemsGatewayController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let itemsClassificationService: ItemsClassificationService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ItemsClassificationService)
            .useValue({
                classifyNewItem: jest.fn(),
                classifyNewBatch: jest.fn(),
                classifyExistentBatch: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        itemsClassificationService = moduleFixture.get<ItemsClassificationService>(ItemsClassificationService);

        // Clear database before each test
        await prismaService.$transaction([
            prismaService.itemCitedFragment.deleteMany(),
            prismaService.userSubscribedItem.deleteMany(),
            prismaService.userHiddenItem.deleteMany(),
            prismaService.itemClassification.deleteMany(),
            prismaService.item.deleteMany(),
        ]);
    });

    afterAll(async () => {
        await app.close();
    });

    // Mock data for classification
    const mockClassificationResult = {
        unclassifiedItem: {
            title: 'Test Item',
            description: 'Description for test item',
            category: 'Testing',
            link: 'http://test.com',
        },
        itemField: ItemField.PROGRAMMING_LANGUAGES,
        insightsValues: {
            /* some insights */
        },
        classification: ItemClassificationType.ADOPT,
        itemSummary: 'Summary of test item',
    };

    const mockCreateUnclassifiedItemDto: CreateUnclassifiedItemDto = {
        title: 'Test Item',
        description: 'Description for test item',
        category: 'Testing',
        link: 'http://test.com',
    };

    describe('POST /tech-survey/survey-items/create', () => {
        it('should create a new item and its classification', async () => {
            jest.spyOn(itemsClassificationService, 'classifyNewItem').mockResolvedValue(mockClassificationResult);

            await request(app.getHttpServer())
                .post('/tech-survey/survey-items/create')
                .set('userId', USER_ID) // Assuming userId is passed in headers for authentication
                .send(mockCreateUnclassifiedItemDto)
                .expect(201);

            const createdItem = await prismaService.item.findFirst({
                where: { title: 'Test Item' },
                include: { latestClassification: true, subscribedBy: true },
            });

            expect(createdItem).toBeDefined();
            expect(createdItem?.title).toBe('Test Item');
            expect(createdItem?.latestClassification).toBeDefined();
            expect(createdItem?.latestClassification?.classification).toBe(ItemClassificationType.ADOPT);
            expect(createdItem?.subscribedBy.some((sub) => sub.userId === USER_ID)).toBe(true);
        });
    });
});
