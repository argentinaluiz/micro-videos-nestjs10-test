import { IUseCase } from '../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Category, CategoryId } from '../../domain/category.entity';
import { CategoryRepository } from '../../domain/category.repository';
import { CategoryOutput, CategoryOutputMapper } from '../dto/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const categorId = new CategoryId(input.id);
    const category = await this.categoryRepo.findById(categorId);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
