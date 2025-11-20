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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  findAll(@Query('threadId') threadId?: string) {
    if (threadId) {
      return this.postsService.findByThread(+threadId);
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const post = await this.postsService.findOne(+id);

    // Users can only update their own posts unless they're admin
    if (
      post.author_id !== req.user.userId &&
      !req.user.roles.includes('admin')
    ) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const post = await this.postsService.findOne(+id);

    // Users can delete their own posts, admins can delete any post
    if (
      post.author_id !== req.user.userId &&
      !req.user.roles.includes('admin')
    ) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.postsService.remove(+id);
  }
}
