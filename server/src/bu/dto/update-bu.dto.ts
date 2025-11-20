import { IsOptional, IsString } from 'class-validator';

export class UpdateBuDto {
  @IsString()
  @IsOptional()
  name?: string;
}
