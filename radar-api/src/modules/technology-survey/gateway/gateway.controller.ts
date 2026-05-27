import type { UUID } from 'crypto';
import { Get, Body, Patch, Param, Logger, Delete, Controller, ParseUUIDPipe, Req, Post } from '@nestjs/common';
import { UserSubscribedItem, Item } from '@prisma/client';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { ItemsGatewayService } from './gateway.service';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';
import { IdBatchDto } from '@/modules/shared/dto/id-batch.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('tech-survey')
@Controller('tech-survey/survey-items')
export class ItemsGatewayController {
    private readonly logger: Logger = new Logger('SurveyItemsController');

    constructor(private readonly itemsService: ItemsGatewayService) {
        this.logger.log('Initialized');
    }

    @Get('recommended')
    @ApiOperation({ summary: 'Obtiene las recomendaciones disponibles para el usuario actual.' })
    @ApiResponse({ status: 200, description: 'Lista de ítems recomendados obtenida correctamente.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async findAllRecommendations(@Req() request: AuthenticatedRequest): Promise<Item[]> {
        this.logger.log('Executed findAllRecommendations');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findAllRecommended(userId);
    }

    @Get('subscribed')
    @ApiOperation({ summary: 'Recupera los ítems a los que el usuario se ha suscrito.' })
    @ApiResponse({ status: 200, description: 'Lista de ítems suscritos obtenida correctamente.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async findAllSubscribed(@Req() request: AuthenticatedRequest): Promise<Item[]> {
        this.logger.log('Executed findAllSubscribed');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findAllSubscribed(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtiene un ítem específico por su UUID para el usuario actual.' })
    @ApiResponse({ status: 200, description: 'Ítem encontrado correctamente.' })
    @ApiResponse({ status: 404, description: 'Ítem no encontrado o no accesible.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiParam({ name: 'id', description: 'UUID del ítem a recuperar.' })
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<Item | null> {
        this.logger.log('Executed findOne');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findOne(id, userId);
    }

    @Post('batch')
    @ApiOperation({ summary: 'Crea múltiples ítems sin clasificar y los clasifica automáticamente.' })
    @ApiResponse({ status: 201, description: 'Ítems creados correctamente.' })
    @ApiResponse({ status: 400, description: 'Datos de creación inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiBody({ type: [CreateUnclassifiedItemDto], description: 'Array de ítems sin clasificar a crear.' })
    async createBatch(@Body() data: CreateUnclassifiedItemDto[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.createBatch(data, userId);
    }

    @Patch('subscribe/batch')
    @ApiOperation({ summary: 'Suscribe al usuario a múltiples ítems en una sola operación.' })
    @ApiResponse({ status: 200, description: 'Suscripciones procesadas correctamente.' })
    @ApiResponse({ status: 400, description: 'IDs de ítems inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async subscribeBatch(@Body() data: IdBatchDto, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed subscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.subscribeBatch(data, userId);
    }

    @Patch('unsubscribe/batch')
    @ApiOperation({ summary: 'Desuscribe al usuario de múltiples ítems a la vez.' })
    @ApiResponse({ status: 200, description: 'Desuscripciones procesadas correctamente.' })
    @ApiResponse({ status: 400, description: 'IDs de ítems inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async unsubscribeBatch(@Body() data: IdBatchDto, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.unsubscribeBatch(data, userId);
    }

    @Delete('batch')
    @ApiOperation({ summary: 'Elimina o marca como ocultos múltiples ítems para el usuario actual.' })
    @ApiResponse({ status: 200, description: 'Ítems procesados correctamente para eliminación/ocultamiento.' })
    @ApiResponse({ status: 400, description: 'IDs de ítems inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async removeBatch(@Body() data: IdBatchDto, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed removeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.removeBatch(data, userId);
    }

    @Post()
    @ApiOperation({
        summary: 'Crea un nuevo ítem sin clasificar y lo clasifica automáticamente para el usuario actual.',
    })
    @ApiResponse({ status: 201, description: 'Ítem creado correctamente.' })
    @ApiResponse({ status: 400, description: 'Datos de creación inválidos.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async create(@Body() data: CreateUnclassifiedItemDto, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.create(data, userId);
    }

    @Patch('subscribe/:id')
    @ApiOperation({ summary: 'Suscribe al usuario a un ítem específico por UUID.' })
    @ApiResponse({ status: 200, description: 'Suscripción realizada correctamente.' })
    @ApiResponse({ status: 404, description: 'Ítem no encontrado o no accesible.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiParam({ name: 'id', description: 'UUID del ítem a suscribir.' })
    async subscribe(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserSubscribedItem> {
        this.logger.log('Executed subscribe');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.subscribeOne(id, userId);
    }

    @Patch('unsubscribe/:id')
    @ApiOperation({ summary: 'Desuscribe al usuario de un ítem específico por UUID.' })
    @ApiResponse({ status: 200, description: 'Desuscripción realizada correctamente.' })
    @ApiResponse({ status: 404, description: 'Ítem no encontrado o no accesible.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiParam({ name: 'id', description: 'UUID del ítem a desuscribir.' })
    async unsubscribe(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribe');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.unsubscribeOne(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Elimina o marca como oculto un ítem específico por UUID.' })
    @ApiResponse({ status: 200, description: 'Ítem eliminado o ocultado correctamente.' })
    @ApiResponse({ status: 404, description: 'Ítem no encontrado o no accesible.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    @ApiParam({ name: 'id', description: 'UUID del ítem a eliminar.' })
    async remove(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed remove');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.removeOne(id, userId);
    }
}
