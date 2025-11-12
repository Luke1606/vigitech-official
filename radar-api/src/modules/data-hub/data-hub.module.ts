import { Module } from '@nestjs/common';
import { DataGatewayModule } from './data-gateway/data-gateway.module';

@Module({
    imports: [DataGatewayModule],
})
export class DataHubModule {}
