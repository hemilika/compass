import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConversationMessage {
    @IsString()
    role: 'user' | 'assistant';

    @IsString()
    @MaxLength(2000)
    content: string;
}

export class AiSearchDto {
    @IsString()
    @MaxLength(500)
    query: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConversationMessage)
    conversationHistory?: ConversationMessage[];

    @IsOptional()
    @IsString()
    buId?: string;

    @IsOptional()
    @IsString()
    threadId?: string;
}
