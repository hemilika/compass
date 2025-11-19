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
    constructor(private readonly threadsService: ThreadsService) { }

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
        // Only admins or thread moderators can update threads
        if (!req.user.roles.includes('admin')) {
            const isModerator = await this.threadsService.isUserModerator(+id, req.user.userId);
            if (!isModerator) {
                throw new ForbiddenException('Only admins or thread moderators can update threads');
            }
        }
        return this.threadsService.update(+id, updateThreadDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        // Only admins can delete threads
        if (!req.user.roles.includes('admin')) {
            throw new ForbiddenException('Only admins can delete threads');
        }
        return this.threadsService.remove(+id);
    }

    @Post(':id/users/:userId')
    async addUser(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Body('role') role: string,
        @Request() req,
    ) {
        // Only admins or thread moderators can add users
        if (!req.user.roles.includes('admin')) {
            const isModerator = await this.threadsService.isUserModerator(+id, req.user.userId);
            if (!isModerator) {
                throw new ForbiddenException('Only admins or thread moderators can add users');
            }
        }
        return this.threadsService.addUserToThread(+id, +userId, role);
    }

    @Delete(':id/users/:userId')
    async removeUser(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Request() req,
    ) {
        // Only admins or thread moderators can remove users
        if (!req.user.roles.includes('admin')) {
            const isModerator = await this.threadsService.isUserModerator(+id, req.user.userId);
            if (!isModerator) {
                throw new ForbiddenException('Only admins or thread moderators can remove users');
            }
        }
        return this.threadsService.removeUserFromThread(+id, +userId);
    }
}
