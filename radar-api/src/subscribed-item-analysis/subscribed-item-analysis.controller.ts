import type { UUID } from 'crypto';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
} from '@nestjs/common';

import { SubscribedItemAnalysisService } from './subscribed-item-analysis.service';

@Controller('subscribed-item-analysis')
export class SubscribedItemAnalysisController {
  private readonly Logger: Logger = new Logger(
    'SubscribedItemAnalysisController',
  );

  constructor(
    private readonly subscribedItemAnalysisService: SubscribedItemAnalysisService,
  ) {
    this.Logger.log('Initialized');
  }

  @Get(':itemId')
  async findAllInsideIntervalFromObjective(
    @Param(':itemId', ParseUUIDPipe) itemId: UUID,
    @Body('startDate', ParseDatePipe) startDate: Date,
    @Body('endDate', ParseDatePipe) endDate: Date,
  ) {
    return await this.subscribedItemAnalysisService.findAllInsideIntervalFromObjective(
      itemId,
      startDate,
      endDate,
    );
  }

  @Get(':itemId')
  async findLastFromItem(@Param(':itemId', ParseUUIDPipe) itemId: UUID) {
    return await this.subscribedItemAnalysisService.findLastFromItem(itemId);
  }
}
