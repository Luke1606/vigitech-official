import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
// import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../../../../common/services/prisma.service';

/**
 * Módulo para la gestión de tareas programadas (cron jobs).
 * Configura el `ScheduleModule` y provee el `SchedulingService`
 * junto con las dependencias necesarias para el pipeline de cuadrantes.
 */
@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [
        // SchedulingService,
        PrismaService,
        // QuadrantPipelineService,
    ],
    // exports: [SchedulingService],
})
export class SchedulingModule {}
