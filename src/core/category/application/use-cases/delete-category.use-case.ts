import { IUseCase } from '../../../shared/application/use-case-interface';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CategoryRepository } from '../../domain/category.repository';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const uuid = new Uuid(input.id);
    await this.categoryRepository.delete(uuid);
  }
}

export type DeleteCategoryInput = {
  id: string;
};

type DeleteCategoryOutput = void;
