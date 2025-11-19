import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller()
export class SearchController {
    constructor(private readonly search: SearchService) { }

    @Get('search')
    run(@Query() q: SearchQueryDto) {
        return this.search.search({
            query: q.query,
            type: q.type,
            match: q.match,
            buId: q.buId ? Number(q.buId) : undefined,
            threadId: q.threadId ? Number(q.threadId) : undefined,
            sort: q.sort,
            page: q.page ? Number(q.page) : 1,
            limit: q.limit ? Number(q.limit) : 20,
        });
    }

    @Get('health')
    health() {
        return { status: 'ok', timestamp: Date.now() };
    }

    @Get('stats')
    stats() {
        return this.search.stats();
    }

    @Get('debug/docs')
    docs() {
        return this.search['documents'];
    }
}
