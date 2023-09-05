import { SearchableRepositoryInterface } from '../../shared/domain/repository/repository-interface';
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
} from '../../shared/domain/repository/search-params';
import { Category, CategoryId } from './category.entity';

export type CategoryFilter = string;

export class CategorySearchParams extends DefaultSearchParams<CategoryFilter> {}

export class CategorySearchResult extends DefaultSearchResult<Category> {}

export interface CategoryRepository
  extends SearchableRepositoryInterface<
    Category,
    CategoryId,
    CategoryFilter,
    CategorySearchParams,
    CategorySearchResult
  > {}
