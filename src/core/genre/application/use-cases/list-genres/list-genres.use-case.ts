import { GenreOutput, GenreOutputMapper } from '../../dto/genre-output';
import { IUseCase } from '../../../../shared/application/use-case-interface';
import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from '../../../../shared/application/pagination-output';
import {
  IGenreRepository,
  GenreSearchParams,
  GenreSearchResult,
} from '../../../domain/genre.repository';
import { ICategoryRepository } from '../../../../category/domain/category.repository';
import { ListGenresInput } from './list-genres.input';

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepo.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const categoriesIdRelated = searchResult.items.reduce((acc, item) => {
      return acc.concat([...item.categories_id.values()]);
    }, []);
    const categoriesRelated =
      await this.categoryRepo.findByIds(categoriesIdRelated);

    const items = _items.map((i) => {
      const categoriesOfGenre = categoriesRelated.filter((c) =>
        i.categories_id.has(c.category_id.id),
      );
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutputDto<GenreOutput>;
