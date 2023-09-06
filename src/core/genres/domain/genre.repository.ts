import { CategoryId } from '../../category/domain/category.aggregate';
import { Either } from '../../shared/domain/either';
import { ISearchableRepository } from '../../shared/domain/repository/repository-interface';
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchParamsConstructorProps,
} from '../../shared/domain/repository/search-params';
import { SearchValidationError } from '../../shared/domain/validators/validation.error';
import InvalidUuidError from '../../shared/domain/value-objects/uuid.vo';
import { Genre, GenreId } from './genre.aggregate';

export type GenreFilter = {
  name?: string;
  categories_id?: CategoryId[];
};

export class GenreSearchParams extends DefaultSearchParams<GenreFilter> {
  private constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
      filter?: {
        name?: string;
        categories_id?: CategoryId[] | string[];
      };
    } = {},
  ) {
    const [categories_id, errorCategoriesId] = Either.of(
      props.filter?.categories_id,
    )
      .map((value) => value || [])
      .chainEach<CategoryId[], InvalidUuidError[]>((value) =>
        Either.safe(() =>
          value instanceof CategoryId ? value : new CategoryId(value),
        ),
      )
      .asArray();

    if (errorCategoriesId) {
      const error = new SearchValidationError([
        { categories_id: errorCategoriesId.map((error) => error.message) },
      ]);
      throw error;
    }

    return new GenreSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        categories_id,
      },
    });
  }

  get filter(): GenreFilter | null {
    return this._filter;
  }

  protected set filter(value: GenreFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value.name && { name: `${_value?.name}` }),
      ...(_value.categories_id &&
        _value.categories_id.length && {
          categories_id: _value.categories_id,
        }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class GenreSearchResult extends DefaultSearchResult<Genre> {}

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > {}
