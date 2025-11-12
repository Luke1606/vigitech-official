import { Module } from '@nestjs/common';
import { DataGatewayController } from './data-gateway.controller';
import { DataGatewayService } from './data-gateway.service';

@Module({
    controllers: [DataGatewayController],
    providers: [DataGatewayService],
})
export class DataGatewayModule {}
