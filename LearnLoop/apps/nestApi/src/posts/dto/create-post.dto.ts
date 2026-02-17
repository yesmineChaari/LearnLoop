import { IsNotEmpty, IsOptional, IsString, MaxLength,IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(2000)
  media?: string;
}
