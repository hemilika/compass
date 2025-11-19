import { IsEmail, IsOptional, IsString, IsArray, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsOptional()
    lastname?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsArray()
    @IsOptional()
    techstack?: string[];

    @IsArray()
    @IsOptional()
    user_roles?: string[];

    @IsArray()
    @IsOptional()
    hobbies?: string[];
}
