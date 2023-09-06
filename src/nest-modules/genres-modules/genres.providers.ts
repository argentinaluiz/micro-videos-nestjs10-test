import { getModelToken } from '@nestjs/sequelize';
import { GenreInMemoryRepository } from '../../core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CreateGenreUseCase } from '../../core/genre/application/use-cases/create-genre.use-case';
import { UpdateGenreUseCase } from '../../core/genre/application/use-cases/update-genre.use-case';
import { ListGenresUseCase } from '../../core/genre/application/use-cases/list-genres.use-case';
import { GetGenreUseCase } from '../../core/genre/application/use-cases/get-genre.use-case';
import { DeleteGenreUseCase } from '../../core/genre/application/use-cases/delete-genre.use-case';
import {
  GenreCategoryModel,
  GenreModel,
  GenreSequelizeRepository,
} from '../../core/genre/infra/db/sequelize/genre-sequelize';
import { IGenreRepository } from '../../core/genre/domain/genre.repository';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import * as CategoryProviders from '../categories-module/categories.providers';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { CategoriesIdsValidator } from '../../core/category/application/validations/categories-ids.validator';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (
      genreModel: typeof GenreModel,
      genreCategoryModel: typeof GenreCategoryModel,
      uow: UnitOfWorkSequelize,
    ) => {
      return new GenreSequelizeRepository(genreModel, genreCategoryModel, uow);
    },
    inject: [
      getModelToken(GenreModel),
      getModelToken(GenreCategoryModel),
      'UnitOfWork',
    ],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdsValidator,
    ) => {
      return new CreateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CategoryProviders.VALIDATIONS.CATEGORIES_IDS_VALIDATOR.provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdsValidator,
    ) => {
      return new UpdateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CategoryProviders.VALIDATIONS.CATEGORIES_IDS_VALIDATOR.provide,
    ],
  },
  LIST_CATEGORIES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new ListGenresUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new GetGenreUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) => {
      return new DeleteGenreUseCase(uow, genreRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};
