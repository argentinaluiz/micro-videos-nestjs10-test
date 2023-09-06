import { CreateGenreUseCase } from '../../create-genre.use-case';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  GenreCategoryModel,
  GenreModel,
  GenreSequelizeRepository,
} from '../../../../infra/db/sequelize/genre-sequelize';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import {
  CategoryModel,
  CategorySequelizeRepository,
} from '../../../../../category/infra/db/sequelize/category-sequelize';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { CategoriesIdsValidator } from '../../../../../category/application/validations/categories-ids.validator';
import { Category } from '../../../../../category/domain/category.aggregate';

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdsValidator: CategoriesIdsValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(
      GenreModel,
      GenreCategoryModel,
      uow,
    );
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdsValidator = new CategoriesIdsValidator(categoryRepo);
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdsValidator,
    );
  });

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    let output = await useCase.execute({
      name: 'test genre',
      categories_id: categoriesId,
    });

    let entity = await genreRepo.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: entity.genre_id.id,
      name: 'test genre',
      categories: expect.arrayContaining(
        categories.map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining(categoriesId),
      is_active: true,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: 'test genre',
      categories_id: [categories[0].category_id.id],
      is_active: true,
    });

    entity = await genreRepo.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: entity.genre_id.id,
      name: 'test genre',
      categories: expect.arrayContaining(
        [categories[0]].map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([categories[0].category_id.id]),
      is_active: true,
      created_at: entity.created_at,
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    const genre = Genre.fake().aGenre().build();
    genre.name = null;

    const mockCreate = jest
      .spyOn(Genre, 'create')
      .mockImplementation(() => genre);

    await expect(
      useCase.execute({
        name: 'test genre',
        categories_id: categoriesId,
      }),
    ).rejects.toThrow('notNull Violation: GenreModel.name cannot be null');

    const genres = await genreRepo.findAll();
    expect(genres.length).toEqual(0);

    mockCreate.mockRestore();
  });
});
