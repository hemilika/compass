import { IsOptional, IsString, IsIn } from 'class-validator';

export class SearchQueryDto {
    @IsString()
    query: string;

    @IsOptional()
    @IsIn(['post', 'reply'])
    type?: 'post' | 'reply';

    @IsOptional()
    match?: 'or' | 'and' | 'exact';

    @IsOptional()
    buId?: string;

    @IsOptional()
    threadId?: string;

    @IsOptional()
    sort?: 'relevance' | 'new' | 'top';

    @IsOptional()
    page?: string;

    @IsOptional()
    limit?: string;
}
