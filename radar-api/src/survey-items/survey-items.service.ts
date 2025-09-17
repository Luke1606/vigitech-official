import type { UUID } from 'crypto';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, SurveyItem } from '@prisma/client';

import { CreateSurveyItemDto } from './dto/create-survey-item.dto';
import { UpdateSurveyItemDto } from './dto/update-survey-item.dto';

@Injectable()
export class SurveyItemsService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger('SurveyItemsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Initialized and connected to database');
  }

  async findAllRecommended(): Promise<SurveyItem[]> {
    this.logger.log('Executed findAllRecommended');

    return await this.surveyItem.findMany({
      where: {
        subscribed: false,
      },
    });
  }

  async findAllSubscribed(): Promise<SurveyItem[]> {
    this.logger.log('Executed findAllSubscribed');

    return await this.surveyItem.findMany({
      where: {
        subscribed: true,
      },
    });
  }

  async findOne(id: UUID): Promise<SurveyItem> {
    this.logger.log(`Executed findOne of ${id}`);

    const item: SurveyItem = await this.surveyItem.findUniqueOrThrow({
      where: { id },
    });

    if (!item) throw new Error(`No existe el item de id ${id}`);
    if (!item.active) throw new Error(`El item de id ${id} no está disponible`);

    return item;
  }

  async renewItems(): Promise<void> {
    this.logger.log('Executed renewItems');
    // borrar los no suscritos
    await this.surveyItem.deleteMany({
      where: {
        active: false,
      },
    });

    const subscribedItems: CreateSurveyItemDto[] = await this.surveyItem
      .findMany({
        where: {
          subscribed: true,
        },
      })
      .then((items: SurveyItem[]) =>
        items.map((item: SurveyItem) => {
          const { title, summary, source } = item;
          return {
            title,
            summary,
            source,
          };
        })
      );

    // obtener nuevos
    const trendingItems: CreateSurveyItemDto[] = await this.getNewTrendings();

    const stillRelevant: CreateSurveyItemDto[] = [];
    const newTrendings: CreateSurveyItemDto[] = [];

    trendingItems.forEach((trendingItem: CreateSurveyItemDto) => {
      if (subscribedItems.includes(trendingItem)) {
        // hace falta ver como verificar que sea el mismo item aunque cambie alguna propiedad en las fuentes
        // mediante la URI o algo asi, pq hasta la URL puede cambiar, y si algo en ese caso llamar a update
        stillRelevant.push(trendingItem);
        subscribedItems.filter((item) => item !== trendingItem);
      } else newTrendings.push(trendingItem);
    });

    const notRelevantAnymore: CreateSurveyItemDto[] = subscribedItems;

    await this.surveyItem.createMany({
      data: { ...newTrendings },
      skipDuplicates: true,
    });

    // notificar los q ya no son relevantes
    this.logger.log(notRelevantAnymore);
  }

  private getNewTrendings(): CreateSurveyItemDto[] {
    this.logger.log('Executed getTrendings');
    return [
      {
        title: 'titulo',
        summary: 'resumen',
        source: 'http://myurl.com',
      },
    ];
  }

  async update(id: UUID, data: UpdateSurveyItemDto): Promise<SurveyItem> {
    return await this.surveyItem.update({
      where: { id },
      data,
    });
  }

  async updateMany(ids: UUID[], data: UpdateSurveyItemDto[]): Promise<void> {
    await this.surveyItem.updateMany({
      where: {
        id: { in: ids },
      },
      data: data,
    });
  }

  async subscribeOne(id: UUID): Promise<SurveyItem> {
    this.logger.log(`Executed subscribe of ${id}`);
    const data: SurveyItem = await this.findOne(id);

    return await this.update(id, {
      ...data,
      subscribed: true,
      active: true,
    });
  }

  async unsubscribeOne(id: UUID): Promise<SurveyItem> {
    this.logger.log(`Executed unsubscribe of ${id}`);
    const data: SurveyItem = await this.findOne(id);

    return await this.update(id, {
      ...data,
      subscribed: false,
    });
  }

  async removeOne(id: UUID): Promise<SurveyItem> {
    this.logger.log(`Executed remove of ${id}`);
    return await this.update(id, {
      subscribed: false,
    });
  }

  async subscribeBatch(ids: UUID[]): Promise<void> {
    this.logger.log(`Executed subscribe of ${ids.length} items`);

    return await this.updateMany(ids, {
      subscribed: true,
      active: true,
    });
  }

  async unsubscribeBatch(ids: UUID[]): Promise<void> {
    this.logger.log(`Executed unsubscribe of ${ids.length} items`);

    return await this.updateMany(ids, {
      subscribed: false,
    });
  }

  async removeBatch(ids: UUID[]): Promise<void> {
    this.logger.log(`Executed remove of ${ids.length} items`);

    return await this.updateMany(ids, {
      subscribed: false,
      active: false,
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
