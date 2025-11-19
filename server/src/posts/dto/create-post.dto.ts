import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreatePostDto {
    @IsNumber()
    @IsNotEmpty()
    thread_id: number;

    @IsNumber()
    @IsOptional()
    bu_id?: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    icon_url?: string;

    @IsArray()
    @IsOptional()
    image_urls?: string[];
}
