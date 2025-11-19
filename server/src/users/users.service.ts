import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: ['bu'],
            select: ['id', 'email', 'firstname', 'lastname', 'roles', 'techstack', 'user_roles', 'hobbies', 'bu_id', 'is_active', 'created_at'],
        });
    }

    async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['bu'],
            select: ['id', 'email', 'firstname', 'lastname', 'roles', 'techstack', 'user_roles', 'hobbies', 'bu_id', 'is_active', 'created_at'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'firstname', 'lastname', 'roles', 'techstack', 'user_roles', 'hobbies', 'bu_id', 'is_active', 'created_at'],
        });
    }

    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'firstname', 'lastname', 'password', 'roles', 'techstack', 'user_roles', 'hobbies', 'bu_id', 'is_active', 'created_at'],
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async deactivate(id: number): Promise<User> {
        const user = await this.findById(id);
        user.is_active = false;
        return this.usersRepository.save(user);
    }

    async activate(id: number): Promise<User> {
        const user = await this.findById(id);
        user.is_active = true;
        return this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        await this.usersRepository.remove(user);
    }
}
