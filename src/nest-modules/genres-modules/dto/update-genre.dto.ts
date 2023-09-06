import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';
import { UpdateGenreInput } from '../../../core/genre/application/use-cases/update-genre.use-case';

export class UpdateGenreDto
  extends PartialType(CreateGenreDto)
  implements Omit<UpdateGenreInput, 'id'> {}
