import { Controller, Get, Query, Logger } from '@nestjs/common';
import { KnowledgeFragment } from '@prisma/client';
import { DataGatewayService } from './data-gateway.service';
import { SearchQueryDto } from './dto/query.dto';

@Controller('data-gateway')
export class DataGatewayController {
    private readonly logger = new Logger(DataGatewayController.name);

    constructor(private readonly dataGatewayService: DataGatewayService) {
        this.logger.log('Initialized');
    }

    @Get('search')
    async search(@Query() queryDto: SearchQueryDto): Promise<KnowledgeFragment[]> {
        this.logger.log(`Received search query: ${JSON.stringify(queryDto)}`);
        return this.dataGatewayService.search(queryDto);
    }
}
