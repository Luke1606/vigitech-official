import { Controller, UseGuards } from '@nestjs/common';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';

// import { UserPreferencesService } from './user-preferences.service';
// import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Controller('preferences')
@UseGuards(SuperTokensAuthGuard)
export class UserPreferencesController {
    // constructor(private readonly userPreferencesService: UserPreferencesService) {}
    // @MessagePattern('createDefaultUserPreferences')
    // create () {
    // 	return this.userPreferencesService.createDefault();
    // }
    // @MessagePattern('findActualUserPreferences')
    // findActualUserPreferences () {
    // 	return this.userPreferencesService.findActualUserPreferences();
    // }
    // @MessagePattern('updateUserPreference')
    // update (@Payload() newPreferences: UpdateUserPreferenceDto) {
    // 	return this.userPreferencesService.update(newPreferences);
    // }
}
