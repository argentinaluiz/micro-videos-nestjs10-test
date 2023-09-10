import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/db/sequelize/genre-sequelize';
import { CategoriesModule } from '../categories-module/categories.module';
import { GENRES_PROVIDERS } from './genres.providers';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRES_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRES_PROVIDERS.USE_CASES),
    ...Object.values(GENRES_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_VALIDATOR.provide,
  ],
})
export class GenresModule {}
