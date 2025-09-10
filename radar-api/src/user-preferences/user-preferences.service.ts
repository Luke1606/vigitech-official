import { Injectable } from '@nestjs/common';

// import { CreateDefaultUserPreferenceDto } from './dto/create-default-user-preference.dto';
// import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class UserPreferencesService {
    // async findActualUserPreferences () {
	// 	const currentUser = await this.userService.getCurrentUser();
	// 	if (!currentUser) return;

    //     return this.preferencesRepository.findOne({ 
	// 		where: { user: currentUser } 
	// 	});
    // }

	// async createDefault () {
	// 	const currentUser = await this.userService.getCurrentUser();
	// 	if (!currentUser) return;

	// 	const defaultPreferences: CreateDefaultUserPreferenceDto = { 
	// 		user: currentUser
	// 	}
	// 	return this.preferencesRepository.create(defaultPreferences);
	// }

	// async update (newPreferences: UpdateUserPreferenceDto) {
    //     return this.preferencesRepository.update(newPreferences.id, newPreferences);
    // }
}
