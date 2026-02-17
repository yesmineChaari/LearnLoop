import { IsOptional, IsString, IsArray, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SearchSortBy {
  NAME = 'name',
  RECENT = 'recent',
  RELEVANCE = 'relevance',
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsToLearn?: string[]; // skill IDs user wants to learn

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsToTeach?: string[]; // skill IDs user can teach

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SearchSortBy)
  sortBy?: SearchSortBy = SearchSortBy.NAME;

  @IsOptional()
  @IsString()
  excludeUserId?: string; // Exclude current user from results
}
