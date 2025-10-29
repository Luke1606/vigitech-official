import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { FeaturesModule } from './features/features.module';

@Module({
    imports: [CommonModule, ConfigModule, FeaturesModule],
})
export class AppModule {}
