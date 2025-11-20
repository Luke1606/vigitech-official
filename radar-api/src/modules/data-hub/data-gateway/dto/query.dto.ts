import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RawDataSource, RawDataType } from '@prisma/client';

export class SearchQueryDto {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsEnum(RawDataSource, { each: true })
    sources?: RawDataSource[];

    @IsOptional()
    @IsEnum(RawDataType, { each: true })
    dataTypes?: RawDataType[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    k?: number = 5; // For semantic search: number of nearest neighbors
}
