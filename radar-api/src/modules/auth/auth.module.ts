/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthConfigService } from './auth.service';

@Module({
    imports: [UsersModule],
    providers: [AuthConfigService],
    exports: [AuthConfigService],
})
export class AuthModule {}
