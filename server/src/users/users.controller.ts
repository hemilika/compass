import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }

    @Get('me/profile')
    getProfile(@Request() req) {
        return this.usersService.findById(req.user.userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        // Users can only update their own profile unless they're admin
        if (req.user.userId !== +id && !req.user.roles.includes('admin')) {
            throw new ForbiddenException('You can only update your own profile');
        }
        return this.usersService.update(+id, updateUserDto);
    }

    @UseGuards(RolesGuard)
    @Roles('admin')
    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(+id);
    }

    @UseGuards(RolesGuard)
    @Roles('admin')
    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.usersService.activate(+id);
    }

    @UseGuards(RolesGuard)
    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
