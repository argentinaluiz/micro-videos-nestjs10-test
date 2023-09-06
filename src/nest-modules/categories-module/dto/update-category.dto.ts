import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryInput } from '../../core/category/application/use-cases/update-category.use-case';

export class UpdateCategoryDto
  extends PartialType(CreateCategoryDto)
  implements Omit<UpdateCategoryInput, 'id'> {}
