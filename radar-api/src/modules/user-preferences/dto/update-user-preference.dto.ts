import type { UUID } from 'crypto';
import { IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaultUserPreferenceDto } from './create-default-user-preference.dto';

export class UpdateUserPreferenceDto extends PartialType(CreateDefaultUserPreferenceDto) {
    @IsUUID()
    id!: UUID;
}
