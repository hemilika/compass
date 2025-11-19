import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class SignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsOptional()
    lastname?: string;

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
