import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  bu_id?: number;

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
