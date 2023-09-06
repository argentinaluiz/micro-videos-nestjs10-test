import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import InvalidUuidError from '../../../../../shared/domain/value-objects/uuid.vo';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import { GenreInMemoryRepository } from '../../../../infra/db/in-memory/genre-in-memory.repository';
import { DeleteGenreUseCase } from '../../delete-genre.use-case';

describe('DeleteGenreUseCase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let repository: GenreInMemoryRepository;

  beforeEach(() => {
    repository = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError('fake id'),
    );

    const genreId = new GenreId();

    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should delete a cast member', async () => {
    const items = [Genre.fake().aGenre().build()];
    repository.items = items;
    await useCase.execute({
      id: items[0].genre_id.id,
    });
    expect(repository.items).toHaveLength(0);
  });
});
