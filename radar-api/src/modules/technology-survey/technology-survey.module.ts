import { Module } from '@nestjs/common';
import { ItemsGatewayModule } from './items-gateway/items-gateway.module';

@Module({
    imports: [ItemsGatewayModule],
})
export class TechnologySurveyModule {}
