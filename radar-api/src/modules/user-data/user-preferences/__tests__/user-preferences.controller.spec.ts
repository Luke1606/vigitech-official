import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from '../user-preferences.controller';
import { UserPreferencesService } from '../user-preferences.service';
import { mockUserPreferencesService, mockAuthenticatedRequest, MOCK_USER_ID } from '../../__mocks__/shared.mock';
import { UUID } from 'crypto';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Frequency } from '@prisma/client';

describe('UserPreferencesController', () => {
    let controller: UserPreferencesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserPreferencesController],
            providers: [{ provide: UserPreferencesService, useValue: mockUserPreferencesService }],
        }).compile();

        controller = module.get<UserPreferencesController>(UserPreferencesController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('findActualUserPreferences debe llamar al servicio con el userId del request', async () => {
        await controller.findActualUserPreferences(mockAuthenticatedRequest);
        expect(mockUserPreferencesService.findActualUserPreferences).toHaveBeenCalledWith(MOCK_USER_ID);
    });

    it('createOrSetToDefault debe llamar al servicio', async () => {
        await controller.createOrSetToDefault(mockAuthenticatedRequest);
        expect(mockUserPreferencesService.createOrSetToDefault).toHaveBeenCalledWith(MOCK_USER_ID);
    });

    it('update debe llamar al servicio con el body', async () => {
        const dto = { recommendationsUpdateFrequency: Frequency.DAILY };
        await controller.update(dto, mockAuthenticatedRequest);
        expect(mockUserPreferencesService.update).toHaveBeenCalledWith(MOCK_USER_ID, dto);
    });
});
