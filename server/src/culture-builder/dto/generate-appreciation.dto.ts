import { IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class GenerateAppreciationDto {
    @IsOptional()
    @IsNumber()
    days?: number;

    @IsOptional()
    @IsBoolean()
    autoPost?: boolean;
}
