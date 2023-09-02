import {GetCategoryUseCase} from "../../get-category.use-case";
import { CategorySequelize } from "../../../../infra/db/sequelize/category-sequelize";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.entity";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";

const { CategoryRepository, CategoryModel } = CategorySequelize;

describe("GetCategoryUseCase Integration Tests", () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelize.CategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  it("should throws error when entity not found", async () => {
    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.value })).rejects.toThrow(
      new NotFoundError(uuid.value, Category)
    );
  });

  it("should returns a category", async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const output = await useCase.execute({ id: category.category_id.value });
    expect(output).toStrictEqual({
        id: category.category_id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
    });
  });
});
