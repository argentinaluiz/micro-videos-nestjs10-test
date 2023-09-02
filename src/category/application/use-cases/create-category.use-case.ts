import { IUseCase } from "../../../shared/application/use-case-interface";
import { CategoryRepository } from "../../domain/category.repository";
import { Category } from "../../domain/category.entity";
import { CategoryOutput, CategoryOutputMapper } from "../dto/category-output";

export class CreateCategoryUseCase implements IUseCase<Input, Output> {
  constructor(private categoryRepo: CategoryRepository.Repository) {}

  async execute(input: Input): Promise<Output> {
    const entity = Category.create(input);
    await this.categoryRepo.insert(entity);
    return CategoryOutputMapper.toOutput(entity);
  }
}

export type Input = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export type Output = CategoryOutput;

export default CreateCategoryUseCase;