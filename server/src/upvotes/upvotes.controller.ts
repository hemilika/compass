import {
    Controller,
    Post,
    Delete,
    Param,
    UseGuards,
    Request,
    Get,
} from '@nestjs/common';
import { UpvotesService } from './upvotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upvotes')
@UseGuards(JwtAuthGuard)
export class UpvotesController {
    constructor(private readonly upvotesService: UpvotesService) { }

    @Post('posts/:postId')
    upvotePost(@Param('postId') postId: string, @Request() req) {
        return this.upvotesService.upvotePost(+postId, req.user.userId);
    }

    @Delete('posts/:postId')
    removeUpvotePost(@Param('postId') postId: string, @Request() req) {
        return this.upvotesService.removeUpvotePost(+postId, req.user.userId);
    }

    @Post('replies/:replyId')
    upvoteReply(@Param('replyId') replyId: string, @Request() req) {
        return this.upvotesService.upvoteReply(+replyId, req.user.userId);
    }

    @Delete('replies/:replyId')
    removeUpvoteReply(@Param('replyId') replyId: string, @Request() req) {
        return this.upvotesService.removeUpvoteReply(+replyId, req.user.userId);
    }

    @Get('me')
    getUserUpvotes(@Request() req) {
        return this.upvotesService.getUserUpvotes(req.user.userId);
    }
}
