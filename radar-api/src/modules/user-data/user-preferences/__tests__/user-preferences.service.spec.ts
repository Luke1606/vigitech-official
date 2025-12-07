import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/services/prisma.service';
import { UserPreferencesService } from '../user-preferences.service';
import { mockPrismaClient } from '../../__mocks__/shared.mock';

describe('UserPreferencesService', () => {
    let service: UserPreferencesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserPreferencesService, { provide: PrismaService, useValue: mockPrismaClient }],
        }).compile();

        service = module.get<UserPreferencesService>(UserPreferencesService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
