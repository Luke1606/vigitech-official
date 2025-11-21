import type { UUID } from 'crypto';
import { IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaultUserPreferenceDto } from './create-default-user-preference.dto';

/**
 * DTO para la actualización de preferencias de usuario.
 * Hereda de `CreateDefaultUserPreferenceDto` y hace que todos sus campos sean opcionales,
 * lo que permite actualizar parcialmente las preferencias.
 */
export class UpdateUserPreferenceDto extends PartialType(CreateDefaultUserPreferenceDto) {
    /**
     * El ID único (UUID) de las preferencias de usuario a actualizar.
     * Este campo es requerido para identificar las preferencias a modificar.
     */
    @IsUUID()
    id!: UUID;
}
