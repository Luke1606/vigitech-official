import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';

@Module({
    imports: [AuthModule, UserDataModule],
})
export class FeaturesModule {}
