import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { ModulesModule } from './modules/modules.module';

@Module({
    imports: [CommonModule, ConfigModule, ModulesModule],
})
export class AppModule {}
