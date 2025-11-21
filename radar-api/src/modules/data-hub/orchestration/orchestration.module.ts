/**
 * Módulo para la orquestación y programación de tareas relacionadas con el Hub de Datos.
 * Gestiona la ejecución programada de la recolección y procesamiento de datos.
 * @module OrchestrationModule
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrchestrationService } from './orchestration.service';
import { CollectionModule } from '../collection/collection.module';
import { ProcessingModule } from '../processing/processing.module';

@Module({
    imports: [ScheduleModule.forRoot(), CollectionModule, ProcessingModule],
    providers: [OrchestrationService],
})
export class OrchestrationModule {}
