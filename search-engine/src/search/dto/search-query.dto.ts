// src/search/dto/search-query.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';

export class SearchQueryDto {
    @IsString()
    query: string;

    @IsOptional()
    @IsIn(['post', 'message'])
    type?: 'post' | 'message';

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    limit?: string; // we'll parse as number in controller
}
