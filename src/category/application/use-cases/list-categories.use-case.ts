import { CategoryOutput, CategoryOutputMapper } from "../dto/category-output";
import { IUseCase } from "../../../shared/application/use-case-interface";
import { CategoryRepository } from "../../domain/category.repository";
import { PaginationOutputDto, PaginationOutputMapper } from "../../../shared/application/pagination-output";
import { SearchInputDto } from "../../../shared/application/search-input";

export namespace ListCategoriesUseCase {
  export class UseCase implements IUseCase<Input, Output> {
    constructor(private categoryRepo: CategoryRepository.Repository) {}
    
    async execute(input: Input): Promise<Output> {
      const params = new CategoryRepository.SearchParams(input);
      const searchResult = await this.categoryRepo.search(params);
      return this.toOutput(searchResult);
    }

    private toOutput(searchResult: CategoryRepository.SearchResult): Output {
      const { items: _items } = searchResult;
      const items = _items.map((i) => {
        return CategoryOutputMapper.toOutput(i);
      });
      return PaginationOutputMapper.toOutput(items, searchResult);
    }
  }

  export type Input = SearchInputDto;

  export type Output = PaginationOutputDto<CategoryOutput>;
}

export default ListCategoriesUseCase;