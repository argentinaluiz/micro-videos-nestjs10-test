import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-work-in-memory';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import { GenreInMemoryRepository } from '../../../../infra/db/in-memory/genre-in-memory.repository';
import { DeleteGenreUseCase } from '../delete-genre.use-case';

describe('DeleteGenreUseCase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let repository: GenreInMemoryRepository;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    repository = new GenreInMemoryRepository(uow);
    useCase = new DeleteGenreUseCase(uow, repository);
  });

  it('should throws error when aggregate not found', async () => {
    const genreId = new GenreId();

    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should delete a genre', async () => {
    const items = [Genre.fake().aGenre().build()];
    repository.items = items;
    await useCase.execute({
      id: items[0].genre_id.id,
    });
    expect(repository.items).toHaveLength(0);
  });
});