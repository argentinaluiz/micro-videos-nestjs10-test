import { Either } from '../../../shared/domain/either';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Genre, GenreId } from '../../domain/genre.aggregate';
import { IGenreRepository } from '../../domain/genre.repository';

export class GenresIdsValidator {
  constructor(private categoryRepo: IGenreRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<GenreId[], NotFoundError[]>> {
    const categoriesId = categories_id.map((id) => new GenreId(id));

    const existsResults = await this.categoryRepo.existsById(categoriesId);
    return existsResults.not_exists.length > 0
      ? Either.fail(
          existsResults.not_exists.map((c) => new NotFoundError(c.id, Genre)),
        )
      : Either.ok(categoriesId);
  }
}
