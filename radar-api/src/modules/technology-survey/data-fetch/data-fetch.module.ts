import { Module } from '@nestjs/common';
import { DataFetchService } from './data-fetch.service';
import { DataGatewayModule } from '../../data-hub/data-gateway/data-gateway.module';

@Module({
    imports: [DataGatewayModule],
    providers: [DataFetchService],
    exports: [DataFetchService],
})
export class DataFetchModule {}
