import { Module } from '@nestjs/common';
import { SupabaseGuard } from './guards/guard';

@Module({
    providers: [SupabaseGuard],
})
export class CommonModule {}
