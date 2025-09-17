import { Test, TestingModule } from '@nestjs/testing';
import { SurveyItemsController } from './survey-items.controller';
import { SurveyItemsService } from './survey-items.service';

describe('SurveyItemsController', () => {
    let controller: SurveyItemsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SurveyItemsController],
            providers: [SurveyItemsService],
        }).compile();

        controller = module.get<SurveyItemsController>(SurveyItemsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
