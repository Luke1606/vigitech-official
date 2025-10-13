import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { UsersModule } from '../modules/users/users.module';

@Module({
    imports: [UsersModule],
    providers: [HttpExceptionFilter],
    exports: [HttpExceptionFilter],
})
export class CommonModule {}
