import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuService } from './bu.service';
import { BuController } from './bu.controller';
import { Bu } from './bu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bu])],
  controllers: [BuController],
  providers: [BuService],
  exports: [BuService],
})
export class BuModule {}
