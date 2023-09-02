import { IUseCase } from "../../../shared/application/use-case-interface";
import { NotFoundError } from "../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../domain/category.entity";
import { CategoryRepository } from "../../domain/category.repository";
import { CategoryOutput, CategoryOutputMapper } from "../dto/category-output";

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: CategoryRepository.Repository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepo.findById(uuid);
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

export default GetCategoryUseCase;

//request e response http
//dados - Category - dados de saida

//UseCase -> domain

//infra -> domain
