import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateUserItemListDto {
    @ApiProperty({ description: 'Nombre de la lista' })
    @IsString()
    name!: string;

    @ApiProperty({ description: 'Id del user propietario' })
    @IsString()
    @IsUUID()
    ownerId!: string;
}
