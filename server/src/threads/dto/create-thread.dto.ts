import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  bu_id?: number;
}
