import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('replies')
@UseGuards(JwtAuthGuard)
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @Post()
  create(@Body() createReplyDto: CreateReplyDto, @Request() req) {
    return this.repliesService.create(createReplyDto, req.user.userId);
  }

  @Get()
  findByPost(@Query('postId') postId: string) {
    return this.repliesService.findByPost(+postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repliesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @Request() req,
  ) {
    const reply = await this.repliesService.findOne(+id);

    // Users can only update their own replies unless they're admin
    if (
      reply.author_id !== req.user.userId &&
      !req.user.roles.includes('admin')
    ) {
      throw new ForbiddenException('You can only update your own replies');
    }

    return this.repliesService.update(+id, updateReplyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const reply = await this.repliesService.findOne(+id);

    // Users can delete their own replies, admins can delete any reply
    if (
      reply.author_id !== req.user.userId &&
      !req.user.roles.includes('admin')
    ) {
      throw new ForbiddenException('You can only delete your own replies');
    }

    return this.repliesService.remove(+id);
  }
}
