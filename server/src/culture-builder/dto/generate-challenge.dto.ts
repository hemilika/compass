import { IsString, IsIn, IsOptional } from 'class-validator';

export class GenerateChallengeDto {
  @IsString()
  @IsIn(['engagement', 'cross-bu', 'mentorship', 'knowledge-share'])
  type: 'engagement' | 'cross-bu' | 'mentorship' | 'knowledge-share';

  @IsOptional()
  @IsString()
  threadId?: string;
}
