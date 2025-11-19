import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

export interface JwtPayload {
    userId: number;
    email: string;
    roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.userId);
        if (!user || !user.is_active) {
            throw new UnauthorizedException('User not found or inactive');
        }
        return { userId: payload.userId, email: payload.email, roles: payload.roles };
    }
}
