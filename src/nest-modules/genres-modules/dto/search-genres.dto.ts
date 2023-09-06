import { ListGenresInput } from '../../../core/genre/application/use-cases/list-genres.use-case';
import { SortDirection } from '../../../core/shared/domain/repository/search-params';

export class SearchGenreDto implements ListGenresInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: {
    name?: string;
    categories?: string[];
  };
}
