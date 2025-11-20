import { Module } from '@nestjs/common';
import { DataGatewayController } from './data-gateway.controller';
import { DataGatewayService } from './data-gateway.service';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [AiAgentsModule],
    controllers: [DataGatewayController],
    providers: [DataGatewayService],
    exports: [DataGatewayService],
})
export class DataGatewayModule {}
