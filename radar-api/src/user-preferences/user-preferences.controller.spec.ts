import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesController', () => {
	let controller: UserPreferencesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
		controllers: [UserPreferencesController],
		providers: [UserPreferencesService],
		}).compile();

		controller = module.get<UserPreferencesController>(
		UserPreferencesController
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
