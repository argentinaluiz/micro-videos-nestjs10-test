import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common-output/category-output';
import { IUseCase } from '../../../../shared/application/use-case-interface';
import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from '../../../../shared/application/pagination-output';
import { SearchInputDto } from '../../../../shared/application/search-input';
import {
  ICategoryRepository,
  CategorySearchParams,
  CategorySearchResult,
} from '../../../domain/category.repository';

export class ListCategoriesUseCase
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const params = new CategorySearchParams(input);
    const searchResult = await this.categoryRepo.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(searchResult: CategorySearchResult): ListCategoriesOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CategoryOutputMapper.toOutput(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCategoriesInput = SearchInputDto;

export type ListCategoriesOutput = PaginationOutputDto<CategoryOutput>;
