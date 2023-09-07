import { CreateCategoryUseCase } from '../create-category.use-case';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  CategoryModel,
  CategorySequelizeRepository,
} from '../../../../infra/db/sequelize/category-sequelize';
import { CategoryId } from '../../../../domain/category.aggregate';
import { CreateCategoryInput } from '../create-category.input';

describe('CreateCategoryUseCase Integration Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a category', async () => {
    let output = await useCase.execute(
      new CreateCategoryInput({ name: 'test' }),
    );
    let aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: null,
      is_active: true,
      created_at: aggregate.created_at,
    });

    output = await useCase.execute(
      new CreateCategoryInput({
        name: 'test',
        description: 'some description',
      }),
    );
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: aggregate.created_at,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: true,
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: aggregate.created_at,
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      is_active: false,
    });
    aggregate = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: aggregate.created_at,
    });
  });
});
