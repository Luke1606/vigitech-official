import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUrl } from "class-validator";
import { Type } from "class-transformer";

export class CreateSurveyItemDto {
    @ApiProperty({ description: 'Título del ítem' })
    @IsString()
    title!: string;
    
    @ApiProperty({ description: 'Descripción o resumen del ítem' })
    @IsString()
    summary!: string;

    @ApiProperty({ description: 'URL de la fuente del ítem, una sea una página o un recurso' })
    @IsString()
    @IsUrl()
    @Type(()=>URL)
    source!: string;
}
