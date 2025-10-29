import type { UUID } from 'crypto';
import { Get, Post, Body, Patch, Param, Logger, Controller, ParseUUIDPipe, Req } from '@nestjs/common';

import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import type { AuthenticatedRequest } from '../../../shared/types/authenticated-request.type';

@Controller('preferences')
export class UserPreferencesController {
    private readonly logger: Logger = new Logger('UserPreferencesController');

    constructor(private readonly userPreferencesService: UserPreferencesService) {
        this.logger.log('Initialized');
    }

    @Post()
    createOrReturnToDefault(@Req() request: AuthenticatedRequest) {
        const userId: UUID = request.userId as UUID;
        return this.userPreferencesService.createOrReturnToDefault(userId);
    }

    @Get()
    findActualUserPreferences(@Req() request: AuthenticatedRequest) {
        const userId: UUID = request.userId as UUID;
        return this.userPreferencesService.findActualUserPreferences(userId);
    }

    @Patch(':id')
    update(@Param('id', new ParseUUIDPipe()) id: UUID, @Body() newPreferences: UpdateUserPreferenceDto) {
        return this.userPreferencesService.update(newPreferences);
    }
}
