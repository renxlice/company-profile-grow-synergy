import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateAcademyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  pdf?: string;

  @IsString()
  author: string;

  @IsNumber()
  rating: number;

  @IsNumber()
  students: number;

  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsString()
  @IsIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
  level: string;

  @IsString()
  @IsIn(['Flexible', 'Weekend', 'Weekday', 'Evening', 'Full Time', 'Part Time'])
  schedule: string;

  @IsString()
  @IsIn(['Online', 'Offline', 'Hybrid'])
  mode: string;
}

export class UpdateAcademyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  pdf?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  students?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
  level?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Flexible', 'Weekend', 'Weekday', 'Evening', 'Full Time', 'Part Time'])
  schedule?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Online', 'Offline', 'Hybrid'])
  mode?: string;
}
