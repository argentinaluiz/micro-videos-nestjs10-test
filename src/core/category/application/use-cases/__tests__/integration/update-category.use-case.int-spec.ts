import { UpdateCategoryUseCase } from '../../update-category.use-case';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import {
  CategoryModel,
  CategorySequelizeRepository,
} from '../../../../infra/db/sequelize/category-sequelize';

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    const categoryId = new CategoryId();
    await expect(() =>
      useCase.execute({ id: categoryId.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
  });

  it('should update a category', async () => {
    const aggregate = Category.fake().aCategory().build();
    repository.insert(aggregate);

    let output = await useCase.execute({
      id: aggregate.category_id.id,
      name: 'test',
    });
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: aggregate.description,
      is_active: true,
      created_at: aggregate.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name: string;
        description?: null | string;
        is_active?: boolean;
      };
      expected: {
        id: string;
        name: string;
        description: null | string;
        is_active: boolean;
        created_at: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
          is_active: false,
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: false,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: false,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
          is_active: true,
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: 'some description',
          is_active: true,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.category_id.id,
          name: 'test',
          description: null,
          is_active: false,
        },
        expected: {
          id: aggregate.category_id.id,
          name: 'test',
          description: null,
          is_active: false,
          created_at: aggregate.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...(i.input.name && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
        ...('is_active' in i.input && { is_active: i.input.is_active }),
      });
      const aggregateUpdated = await repository.findById(
        new CategoryId(i.input.id),
      );
      expect(output).toStrictEqual({
        id: aggregate.category_id.id,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: aggregateUpdated.created_at,
      });
      expect(aggregateUpdated.toJSON()).toStrictEqual({
        category_id: aggregate.category_id.id,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: aggregateUpdated.created_at,
      });
    }
  });
});
