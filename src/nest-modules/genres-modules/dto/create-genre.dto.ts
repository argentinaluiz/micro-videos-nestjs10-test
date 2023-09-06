import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { CreateGenreInput } from '../../../core/genre/application/use-cases/create-genre.use-case';

export class CreateGenreDto implements CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  categories_id: string[];
}
