import { CategoriesIdsValidator } from '../../../../../category/application/validations/categories-ids.validator';
import {
  Category,
  CategoryId,
} from '../../../../../category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../../category/infra/db/in-memory/category-in-memory.repository';
import { AggregateValidationError } from '../../../../../shared/domain/validators/validation.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-work-in-memory';
import { Genre } from '../../../../domain/genre.aggregate';
import { GenreInMemoryRepository } from '../../../../infra/db/in-memory/genre-in-memory.repository';
import { UpdateGenreUseCase } from '../../update-genre.use-case';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdsValidator: CategoriesIdsValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdsValidator = new CategoriesIdsValidator(categoryRepo);
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdsValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id is invalid', async () => {
      expect.assertions(3);
      const genre = Genre.fake().aGenre().build();
      await genreRepo.insert(genre);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdsValidator,
        'validate',
      );
      try {
        await useCase.execute({
          id: genre.genre_id.id,
          name: 'test',
          categories_id: ['1', '2'],
        });
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith(['1', '2']);
        expect(e).toBeInstanceOf(AggregateValidationError);
        expect(e.error).toStrictEqual([
          {
            categories_id: [
              'ID 1 must be a valid UUID',
              'ID 2 must be a valid UUID',
            ],
          },
        ]);
      }
    });

    it('should throw an entity validation error when categories id not found', async () => {
      expect.assertions(3);
      const genre = Genre.fake().aGenre().build();
      await genreRepo.insert(genre);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdsValidator,
        'validate',
      );
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      try {
        await useCase.execute({
          id: genre.genre_id.id,
          name: 'test',
          categories_id: [categoryId1.id, categoryId2.id],
        });
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          categoryId1.id,
          categoryId2.id,
        ]);
        expect(e).toBeInstanceOf(AggregateValidationError);
        expect(e.error).toStrictEqual([
          {
            categories_id: [
              `Category Not Found using ID ${categoryId1.id}`,
              `Category Not Found using ID ${categoryId2.id}`,
            ],
          },
        ]);
      }
    });

    it('should update a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);
      const genre1 = Genre.fake()
        .aGenre()
        .withCategoryId(category1.category_id)
        .withCategoryId(category2.category_id)
        .build();
      await genreRepo.insert(genre1);
      const spyUpdate = jest.spyOn(genreRepo, 'update');
      const spyUowDo = jest.spyOn(uow, 'do');
      let output = await useCase.execute({
        id: genre1.genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id],
      });
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepo.items[0].genre_id.id,
        name: 'test',
        categories: [category1].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        categories_id: [category1.category_id.id],
        is_active: true,
        created_at: genreRepo.items[0].created_at,
      });

      output = await useCase.execute({
        id: genre1.genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: false,
      });
      expect(spyUpdate).toHaveBeenCalledTimes(2);
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        id: genreRepo.items[0].genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
        categories: [category1, category2].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        is_active: false,
        created_at: genreRepo.items[0].created_at,
      });
    });
  });
});
