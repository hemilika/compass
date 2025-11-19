import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateReplyDto {
    @IsNumber()
    @IsNotEmpty()
    post_id: number;

    @IsNumber()
    @IsOptional()
    parent_reply_id?: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    @IsOptional()
    image_urls?: string[];
}
