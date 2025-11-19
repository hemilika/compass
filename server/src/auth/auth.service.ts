import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signup(signupDto: SignupDto) {
        const existingUser = await this.usersService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(signupDto.password, 10);

        const user = await this.usersService.create({
            ...signupDto,
            password: hashedPassword,
            roles: ['user'],
        });

        const payload = { userId: user.id, email: user.email, roles: user.roles };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                roles: user.roles,
            },
        };
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmailWithPassword(email);
        if (!user || !user.is_active) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { userId: user.id, email: user.email, roles: user.roles };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                roles: user.roles,
            },
        };
    }
}
