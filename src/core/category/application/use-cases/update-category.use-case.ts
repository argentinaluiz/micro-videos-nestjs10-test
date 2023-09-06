import { IUseCase } from '../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { AggregateValidationError } from '../../../shared/domain/validators/validation.error';
import { Category, CategoryId } from '../../domain/category.aggregate';
import { ICategoryRepository } from '../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from '../dto/category-output';

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepo.findById(categoryId);

    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    input.name && category.changeName(input.name);
    if ('description' in input) {
      category.changeDescription(input.description);
    }

    if (input.is_active === true) {
      category.activate();
    }

    if (input.is_active === false) {
      category.deactivate();
    }

    if (category.notification.hasErrors()) {
      throw new AggregateValidationError(category.notification.toJSON());
    }

    await this.categoryRepo.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateCategoryOutput = CategoryOutput;
