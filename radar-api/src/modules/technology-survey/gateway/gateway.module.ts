import { Module } from '@nestjs/common';
import { ItemsGatewayService } from './gateway.service';
import { ItemsGatewayController } from './gateway.controller';
import { ItemsClassificationModule } from '../items-classification/items-classification.module';

@Module({
    imports: [ItemsClassificationModule],
    controllers: [ItemsGatewayController],
    providers: [ItemsGatewayService],
    exports: [ItemsGatewayService],
})
export class ItemsGatewayModule {}
