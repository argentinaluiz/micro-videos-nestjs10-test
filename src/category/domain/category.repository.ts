import { SearchableRepositoryInterface } from "../../shared/domain/repository/repository-interface";
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
} from "../../shared/domain/repository/search-params";
import { Uuid } from "../../shared/domain/value-objects/uuid.vo";
import { Category } from "./category.entity";

export namespace CategoryRepository {
  export type Filter = string;

  export class SearchParams extends DefaultSearchParams<Filter> {}

  export class SearchResult extends DefaultSearchResult<Category, Filter> {}

  export interface Repository
    extends SearchableRepositoryInterface<
      Category,
      Uuid,
      Filter,
      SearchParams,
      SearchResult
    > {}
}
