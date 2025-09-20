import { Module } from '@nestjs/common';
import { Guard } from './guards/guard';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
    providers: [Guard, HttpExceptionFilter],
    exports: [Guard, HttpExceptionFilter],
})
export class CommonModule {}
