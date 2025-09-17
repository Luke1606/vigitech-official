import { Test, TestingModule } from '@nestjs/testing';
import { SurveyItemsService } from './survey-items.service';

describe('SurveyItemsService', () => {
    let service: SurveyItemsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SurveyItemsService],
        }).compile();

        service = module.get<SurveyItemsService>(SurveyItemsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
