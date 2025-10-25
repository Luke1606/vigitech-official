import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
    providers: [HttpExceptionFilter, PrismaService],
    exports: [HttpExceptionFilter, PrismaService],
})
export class CommonModule {}
