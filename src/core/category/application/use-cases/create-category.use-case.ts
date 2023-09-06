import { IUseCase } from '../../../shared/application/use-case-interface';
import { ICategoryRepository } from '../../domain/category.repository';
import { Category } from '../../domain/category.aggregate';
import { CategoryOutput, CategoryOutputMapper } from '../dto/category-output';
import { AggregateValidationError } from '../../../shared/domain/validators/validation.error';

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryOutput> {
    const aggregate = Category.create(input);
    if (aggregate.notification.hasErrors()) {
      throw new AggregateValidationError(aggregate.notification.toJSON());
    }
    await this.categoryRepo.insert(aggregate);
    return CategoryOutputMapper.toOutput(aggregate);
  }
}

export type CreateCategoryInput = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type CreateCategoryOutput = CategoryOutput;
