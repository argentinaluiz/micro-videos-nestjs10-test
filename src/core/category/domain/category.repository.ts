import { SearchableRepositoryInterface } from '../../shared/domain/repository/repository-interface';
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
} from '../../shared/domain/repository/search-params';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Category } from './category.entity';

export type CategoryFilter = string;

export class CategorySearchParams extends DefaultSearchParams<CategoryFilter> {}

export class CategorySearchResult extends DefaultSearchResult<Category> {}

export interface CategoryRepository
  extends SearchableRepositoryInterface<
    Category,
    Uuid,
    CategoryFilter,
    CategorySearchParams,
    CategorySearchResult
  > {}
