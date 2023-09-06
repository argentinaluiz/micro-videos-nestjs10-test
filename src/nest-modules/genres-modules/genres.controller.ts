import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres.use-case';
import { GenreOutput } from '@core/genre/application/dto/genre-output';
import { SearchGenreDto } from './dto/search-genres.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUseCase)
  private createUseCase: CreateGenreUseCase;

  @Inject(UpdateGenreUseCase)
  private updateUseCase: UpdateGenreUseCase;

  @Inject(DeleteGenreUseCase)
  private deleteUseCase: DeleteGenreUseCase;

  @Inject(GetGenreUseCase)
  private getUseCase: GetGenreUseCase;

  @Inject(ListGenresUseCase)
  private listUseCase: ListGenresUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUseCase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchParams: SearchGenreDto) {
    const output = await this.listUseCase.execute(searchParams);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const output = await this.updateUseCase.execute({
      id,
      ...updateGenreDto,
    });
    return GenresController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
