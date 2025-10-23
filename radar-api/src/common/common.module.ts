import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
    providers: [HttpExceptionFilter],
    exports: [HttpExceptionFilter],
})
export class CommonModule {}
