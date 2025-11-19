import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BuService } from './bu.service';
import { CreateBuDto } from './dto/create-bu.dto';
import { UpdateBuDto } from './dto/update-bu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bu')
export class BuController {
  constructor(private readonly buService: BuService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createBuDto: CreateBuDto) {
    return this.buService.create(createBuDto);
  }

  @Get()
  findAll() {
    return this.buService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBuDto: UpdateBuDto) {
    return this.buService.update(+id, updateBuDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buService.remove(+id);
  }
}
