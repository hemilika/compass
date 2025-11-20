import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateThreadDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  bu_id?: number;
}
