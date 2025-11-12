import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from '../user-preferences.controller';
import { UserPreferencesService } from '../user-preferences.service';
import { mockUserPreferencesService } from '../../__mocks__/shared.mock';

describe('UserPreferencesController', () => {
    let controller: UserPreferencesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserPreferencesController],
            providers: [{ provide: UserPreferencesService, useValue: mockUserPreferencesService }],
        }).compile();

        controller = module.get<UserPreferencesController>(UserPreferencesService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
