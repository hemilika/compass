import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateReplyDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @IsOptional()
    image_urls?: string[];
}
