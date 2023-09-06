import { CategoriesIdsValidator } from '../../../../../category/application/validations/categories-ids.validator';
import {
  Category,
  CategoryId,
} from '../../../../../category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../../category/infra/db/in-memory/category-in-memory.repository';
import { AggregateValidationError } from '../../../../../shared/domain/validators/validation.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-work-in-memory';
import { GenreInMemoryRepository } from '../../../../infra/db/in-memory/genre-in-memory.repository';
import { CreateGenreUseCase } from '../../create-genre.use-case';

describe('CreateGenreUseCase Unit Tests', () => {
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdsValidator: CategoriesIdsValidator;
  let uow: UnitOfWorkFakeInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdsValidator = new CategoriesIdsValidator(categoryRepo);
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdsValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id is invalid', async () => {
      expect.assertions(3);
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdsValidator,
        'validate',
      );
      try {
        await useCase.execute({
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
      const spyValidateCategoriesId = jest.spyOn(
        categoriesIdsValidator,
        'validate',
      );
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      try {
        await useCase.execute({
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

    it('should create a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);
      const spyInsert = jest.spyOn(genreRepo, 'insert');
      const spyUowDo = jest.spyOn(uow, 'do');
      let output = await useCase.execute({
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
      });
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepo.items[0].genre_id.id,
        name: 'test',
        categories: [category1, category2].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: true,
        created_at: genreRepo.items[0].created_at,
      });

      output = await useCase.execute({
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
        is_active: false,
      });
      expect(spyInsert).toHaveBeenCalledTimes(2);
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        id: genreRepo.items[1].genre_id.id,
        name: 'test',
        categories_id: [category1.category_id.id, category2.category_id.id],
        categories: [category1, category2].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
        is_active: false,
        created_at: genreRepo.items[1].created_at,
      });
    });
  });
});
