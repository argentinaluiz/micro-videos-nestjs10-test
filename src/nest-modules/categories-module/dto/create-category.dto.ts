import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateCategoryInput } from '../../core/category/application/use-cases/create-category.use-case';

export class CreateCategoryDto implements CreateCategoryInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
