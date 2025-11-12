import { Module } from '@nestjs/common';
import { ItemsGatewayService } from './items-gateway.service';
import { ItemsGatewayController } from './items-gateway.controller';

@Module({
    controllers: [ItemsGatewayController],
    providers: [ItemsGatewayService],
})
export class ItemsGatewayModule {}
