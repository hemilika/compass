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
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('threads')
@UseGuards(JwtAuthGuard)
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  create(@Body() createThreadDto: CreateThreadDto, @Request() req) {
    return this.threadsService.create(createThreadDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.threadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Request() req,
  ) {
    const thread = await this.threadsService.findOne(+id);

    // Only admins or thread owners can update threads

    console.log(
      !req.user.roles.includes('admin'),
      +thread.creator_id,
      +req.user.userId,
    );

    if (
      !req.user.roles.includes('admin') &&
      +thread.creator_id !== +req.user.userId
    ) {
      throw new ForbiddenException(
        'Only admins or thread owners can update threads',
      );
    }
    return this.threadsService.update(+id, updateThreadDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const thread = await this.threadsService.findOne(+id);

    // Only admins or the thread creator can delete threads
    if (
      !req.user.roles.includes('admin') &&
      +thread.creator_id !== +req.user.userId
    ) {
      throw new ForbiddenException(
        'Only admins or the thread creator can delete threads',
      );
    }
    return this.threadsService.remove(+id);
  }

  @Post(':id/join')
  async joinThread(@Param('id') id: string, @Request() req) {
    return this.threadsService.addUserToThread(+id, req.user.userId, 'member');
  }

  @Delete(':id/leave')
  async leaveThread(@Param('id') id: string, @Request() req) {
    return this.threadsService.removeUserFromThread(+id, req.user.userId);
  }
}
