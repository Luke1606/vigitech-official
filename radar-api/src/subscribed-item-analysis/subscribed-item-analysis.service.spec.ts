import { Test, TestingModule } from '@nestjs/testing';
import { SubscribedItemAnalysisService } from './subscribed-item-analysis.service';

describe('SubscribedItemAnalysisService', () => {
    let service: SubscribedItemAnalysisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SubscribedItemAnalysisService],
        }).compile();

        service = module.get<SubscribedItemAnalysisService>(
            SubscribedItemAnalysisService
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
