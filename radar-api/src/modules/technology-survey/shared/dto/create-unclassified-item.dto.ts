import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUnclassifiedItemDto {
    @ApiProperty({ description: 'Título del ítem' })
    @IsString()
    title!: string;
}
