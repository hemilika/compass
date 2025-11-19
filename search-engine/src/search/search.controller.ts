import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller()
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('search')
    search(@Query() query: SearchQueryDto) {
        const limit = query.limit ? parseInt(query.limit, 10) : 20;

        const results = this.searchService.search({
            query: query.query,
            type: query.type,
            categoryId: query.categoryId,
            limit,
        });

        return {
            query,
            count: results.length,
            results,
        };
    }

    // Extra debug endpoints
    @Get('debug/documents')
    documents() {
        return this.searchService.getIndexedDocuments();
    }

    @Get('debug/categories')
    categories() {
        return this.searchService.getCategories();
    }

    @Get('debug/posts')
    posts() {
        return this.searchService.getPosts();
    }
}
