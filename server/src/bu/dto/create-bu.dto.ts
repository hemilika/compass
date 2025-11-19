import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBuDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
