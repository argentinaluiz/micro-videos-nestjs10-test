import { IUseCase } from '../../../shared/application/use-case-interface';
import { GenreId } from '../../domain/genre.aggregate';
import { IGenreRepository } from '../../domain/genre.repository';

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(private GenreRepository: IGenreRepository) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    const genreId = new GenreId(input.id);
    await this.GenreRepository.delete(genreId);
  }
}

export type DeleteGenreInput = {
  id: string;
};

type DeleteGenreOutput = void;
