import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GenerateScriptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  idea!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  language!: string;

  @IsString()
  @IsIn(['professional', 'friendly', 'funny', 'storytelling'])
  tone!: 'professional' | 'friendly' | 'funny' | 'storytelling';

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  targetAudience!: string;

  @IsString()
  @IsIn(['tiktok', 'youtube', 'instagram'])
  platform!: 'tiktok' | 'youtube' | 'instagram';

  @IsInt()
  @IsIn([30, 60, 90, 180])
  duration!: 30 | 60 | 90 | 180;

  @IsString()
  @IsIn(['educational', 'review', 'marketing', 'story'])
  contentType!: 'educational' | 'review' | 'marketing' | 'story';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalInstructions?: string;
}
