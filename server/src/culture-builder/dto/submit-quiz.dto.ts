import { IsInt, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class SubmitQuizDto {
    @IsInt()
    quizId: number;

    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsInt({ each: true })
    answers: number[];
}
