import { SearchInput } from '../../../../shared/application/search-input';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { IsArray, IsUUID, ValidateNested, validateSync } from 'class-validator';

export class ListGenresFilter {
  name?: string | null;
  @IsUUID()
  @IsArray()
  categories_id?: string[] | null;
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListGenresFilter;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput) {
    return validateSync(input);
  }
}
