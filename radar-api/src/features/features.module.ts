import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DataManagementModule } from './data-management/data-management.module';

@Module({
    imports: [AuthModule, DataManagementModule],
})
export class FeaturesModule {}
