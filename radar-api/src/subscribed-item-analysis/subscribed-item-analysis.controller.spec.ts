import { Test, TestingModule } from '@nestjs/testing';
import { ItemAnalysisController } from './subscribed-item-analysis.controller';
import { ItemAnalysisService } from './subscribed-item-analysis.service';

describe('ItemAnalysisController', () => {
    let controller: ItemAnalysisController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ItemAnalysisController],
            providers: [ItemAnalysisService],
        }).compile();

        controller = module.get<ItemAnalysisController>(ItemAnalysisController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
