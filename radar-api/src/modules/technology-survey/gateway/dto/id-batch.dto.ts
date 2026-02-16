import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class IdBatchDto {
    @ApiProperty({ description: 'Array de IDs de los ítems', example: ['uuid-1', 'uuid-2'] })
    @IsArray()
    @IsUUID('all', { each: true })
    itemIds!: UUID[];
}
