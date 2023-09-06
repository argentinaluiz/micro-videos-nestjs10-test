import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import * as CastMemberProviders from './genres.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/db/sequelize/genre-sequelize';
import { CategoriesModule } from '../categories-module/categories.module';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(CastMemberProviders.REPOSITORIES),
    ...Object.values(CastMemberProviders.USE_CASES),
  ],
})
export class GenresModule {}
