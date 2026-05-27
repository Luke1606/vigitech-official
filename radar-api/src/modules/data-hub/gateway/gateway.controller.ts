/**
 * Controlador para el acceso a datos y la ejecución de búsquedas a través del Data Gateway.
 * Expone un endpoint `/search` para realizar búsquedas especializadas e híbridas.
 * @class DataGatewayController
 */
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { DataGatewayService } from './gateway.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { KnowledgeFragment } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('data-hub')
@Controller('data-hub')
export class DataGatewayController {
    private readonly logger = new Logger(DataGatewayController.name);

    /**
     * @param dataGatewayService Servicio del Data Gateway para realizar las operaciones de búsqueda.
     */
    constructor(private readonly dataGatewayService: DataGatewayService) {
        this.logger.log('Initialized');
    }

    /**
     * Maneja las solicitudes GET a `/data-gateway/search` para realizar búsquedas de fragmentos de conocimiento.
     * @param queryDto Objeto DTO que contiene los parámetros de la consulta de búsqueda.
     * @returns Una promesa que resuelve con un array de `KnowledgeFragment`s.
     */
    @Get('search')
    @ApiOperation({ summary: 'Busca fragmentos de conocimiento utilizando texto, filtros y búsqueda semántica.' })
    @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente.' })
    @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async search(@Query() queryDto: SearchQueryDto): Promise<KnowledgeFragment[]> {
        this.logger.log(`Received search query: ${JSON.stringify(queryDto)}`);
        return this.dataGatewayService.search(queryDto);
    }
}
