import { UpdateCategoryUseCase } from "../../update-category.use-case";
import { CategorySequelize } from "../../../../infra/db/sequelize/category-sequelize";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Category } from "../../../../domain/category.entity";

const { CategoryRepository, CategoryModel } = CategorySequelize;

describe("UpdateCategoryUseCase Integration Tests", () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelize.CategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it("should throws error when entity not found", async () => {
    const uuid = new Uuid();
    await expect(() =>
      useCase.execute({ id: uuid.value, name: "fake" })
    ).rejects.toThrow(new NotFoundError(uuid.value, Category))
  });

  it("should update a category", async () => {
    const entity = Category.fake().aCategory().build();
    repository.insert(entity);

    let output = await useCase.execute({ id: entity.category_id.value, name: "test" });
    expect(output).toStrictEqual({
      id: entity.category_id.value,
      name: "test",
      description: entity.description,
      is_active: true,
      created_at: entity.created_at,
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
          id: entity.category_id.value,
          name: "test",
          description: "some description",
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: "some description",
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.value,
          name: "test",
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: "some description",
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.value,
          name: "test",
          is_active: false,
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: "some description",
          is_active: false,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.value,
          name: "test",
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: "some description",
          is_active: false,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.value,
          name: "test",
          is_active: true,
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: "some description",
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.category_id.value,
          name: "test",
          description: null,
          is_active: false,
        },
        expected: {
          id: entity.category_id.value,
          name: "test",
          description: null,
          is_active: false,
          created_at: entity.created_at,
        },
      },
    ];
    
    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...(i.input.name && {name: i.input.name}),
        ...('description' in i.input && {description: i.input.description}),
        ...('is_active' in i.input && {is_active: i.input.is_active}),
      });
      const entityUpdated = await repository.findById(i.input.id);
      expect(output).toStrictEqual({
        id: entity.category_id.value,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: entityUpdated.created_at,
      });
      expect(entityUpdated.toJSON()).toStrictEqual({
        category_id: entity.category_id.value,
        name: i.expected.name,
        description: i.expected.description,
        is_active: i.expected.is_active,
        created_at: entityUpdated.created_at,
      });
    }
  });
});
