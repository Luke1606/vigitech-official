import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';

@Module({
    controllers: [UserPreferencesController],
    providers: [UserPreferencesService],
})
export class UserPreferencesModule {}
