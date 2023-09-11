import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-work-in-memory';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../../infra/db/in-memory/category-in-memory.repository';
import { UpdateCategoryInput } from '../update-category.input';
import { UpdateCategoryUseCase } from '../update-category.use-case';

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository(new UnitOfWorkFakeInMemory());
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    const categoryId = new CategoryId();

    await expect(() =>
      useCase.execute(
        new UpdateCategoryInput({ id: categoryId.id, name: 'fake' }),
      ),
    ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
  });

  it('should throw an error when aggregate is not valid', async () => {
    const aggregate = new Category({ name: 'Movie' });
    repository.items = [aggregate];
    await expect(() =>
      useCase.execute(
        new UpdateCategoryInput({
          id: aggregate.category_id.id,
          name: 't'.repeat(256),
        }),
      ),
    ).rejects.toThrowError('Aggregate Validation Error');
  });

  it('should update a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const aggregate = new Category({ name: 'Movie' });
    repository.items = [aggregate];

    let output = await useCase.execute(
      new UpdateCategoryInput({
        id: aggregate.category_id.id,
        name: 'test',
      }),
    );
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'test',
      description: null,
      is_active: true,
      created_at: aggregate.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name?: string;
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
          id: aggregate.entity_id.id,
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: aggregate.entity_id.id,
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
          description: 'some description',
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
    ];

    for (const i of arrange) {
      output = await useCase.execute(
        new UpdateCategoryInput({
          id: i.input.id,
          ...('name' in i.input && { name: i.input.name }),
          ...('description' in i.input && { description: i.input.description }),
          ...('is_active' in i.input && { is_active: i.input.is_active }),
        }),
      );
      expect(output).toStrictEqual({
        id: aggregate.category_id.id,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
    }
  });
});