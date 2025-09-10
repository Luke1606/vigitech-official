import { Module } from '@nestjs/common';
import { SupabaseGuard } from './guards/supabase.guard';

@Module({
  providers: [SupabaseGuard],
})
export class CommonModule {}