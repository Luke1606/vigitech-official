import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserItemListDto {
    @ApiProperty({ description: 'Nombre de la lista' })
    @IsString()
    name!: string;
}
