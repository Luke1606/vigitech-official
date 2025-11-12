import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateItemDto {
    @ApiProperty({ description: 'Título del ítem' })
    @IsString()
    title!: string;

    @ApiProperty({ description: 'Descripción o resumen del ítem' })
    @IsString()
    summary!: string;
}
