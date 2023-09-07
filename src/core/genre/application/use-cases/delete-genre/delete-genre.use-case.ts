import { IUseCase } from '../../../../shared/application/use-case-interface';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { GenreId } from '../../../domain/genre.aggregate';
import { IGenreRepository } from '../../../domain/genre.repository';

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private GenreRepository: IGenreRepository,
  ) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    const genreId = new GenreId(input.id);
    return this.uow.do(async () => {
      return this.GenreRepository.delete(genreId);
    });
  }
}

export type DeleteGenreInput = {
  id: string;
};

type DeleteGenreOutput = void;
