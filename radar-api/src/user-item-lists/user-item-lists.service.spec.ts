import { Test, TestingModule } from '@nestjs/testing';
import { UserItemListsService } from './user-item-lists.service';

describe('UserItemListsService', () => {
	let service: UserItemListsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
		providers: [UserItemListsService],
		}).compile();

		service = module.get<UserItemListsService>(UserItemListsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
