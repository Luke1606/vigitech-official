import {
    Get,
    Post,
    Body,
    Patch,
    Param,
    Logger,
    Controller,
    ParseUUIDPipe,
} from '@nestjs/common';

import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import type { UUID } from 'crypto';

@Controller('preferences')
export class UserPreferencesController {
    private readonly logger: Logger = new Logger('UserPreferencesController');

    constructor(
        private readonly userPreferencesService: UserPreferencesService
    ) {
        this.logger.log('Initialized');
    }

    @Post()
    create() {
        return this.userPreferencesService.createDefault();
    }

    @Get()
    findActualUserPreferences() {
        return this.userPreferencesService.findActualUserPreferences();
    }

    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Body() newPreferences: UpdateUserPreferenceDto
    ) {
        return this.userPreferencesService.update(newPreferences);
    }
}
