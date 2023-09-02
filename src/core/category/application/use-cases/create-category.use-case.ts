import { IUseCase } from '../../../shared/application/use-case-interface';
import { CategoryRepository } from '../../domain/category.repository';
import { Category } from '../../domain/category.entity';
import { CategoryOutput, CategoryOutputMapper } from '../dto/category-output';

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private categoryRepo: CategoryRepository.Repository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryOutput> {
    const entity = Category.create(input);
    await this.categoryRepo.insert(entity);
    return CategoryOutputMapper.toOutput(entity);
  }
}

export type CreateCategoryInput = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type CreateCategoryOutput = CategoryOutput;
