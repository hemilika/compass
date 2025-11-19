import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bu } from './bu.entity';
import { CreateBuDto } from './dto/create-bu.dto';
import { UpdateBuDto } from './dto/update-bu.dto';

@Injectable()
export class BuService {
    constructor(
        @InjectRepository(Bu)
        private buRepository: Repository<Bu>,
    ) { }

    async create(createBuDto: CreateBuDto): Promise<Bu> {
        const existing = await this.buRepository.findOne({
            where: { name: createBuDto.name },
        });

        if (existing) {
            throw new ConflictException('Business Unit with this name already exists');
        }

        const bu = this.buRepository.create(createBuDto);
        return this.buRepository.save(bu);
    }

    async findAll(): Promise<Bu[]> {
        return this.buRepository.find({
            relations: ['users', 'threads'],
        });
    }

    async findOne(id: number): Promise<Bu> {
        const bu = await this.buRepository.findOne({
            where: { id },
            relations: ['users', 'threads'],
        });

        if (!bu) {
            throw new NotFoundException(`Business Unit with ID ${id} not found`);
        }

        return bu;
    }

    async update(id: number, updateBuDto: UpdateBuDto): Promise<Bu> {
        const bu = await this.findOne(id);

        if (updateBuDto.name) {
            const existing = await this.buRepository.findOne({
                where: { name: updateBuDto.name },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException('Business Unit with this name already exists');
            }
        }

        Object.assign(bu, updateBuDto);
        return this.buRepository.save(bu);
    }

    async remove(id: number): Promise<void> {
        const bu = await this.findOne(id);
        await this.buRepository.remove(bu);
    }
}
