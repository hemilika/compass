import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    icon_url?: string;

    @IsArray()
    @IsOptional()
    image_urls?: string[];
}
