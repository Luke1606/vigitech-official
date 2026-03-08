import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaultUserPreferenceDto } from './create-default-user-preference.dto';

/**
 * DTO para la actualización de preferencias de usuario.
 * Hereda de `CreateDefaultUserPreferenceDto` y hace que todos sus campos sean opcionales,
 * lo que permite actualizar parcialmente las preferencias.
 */
export class UpdateUserPreferenceDto extends PartialType(CreateDefaultUserPreferenceDto) {}
