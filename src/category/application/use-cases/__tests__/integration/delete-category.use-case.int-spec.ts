import { DeleteCategoryUseCase } from "../../delete-category.use-case";
import { CategorySequelize } from "../../../../infra/db/sequelize/category-sequelize";
import { setupSequelize } from "../../../../../shared/infra/testing/helpers";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { Category } from "../../../../domain/category.entity";

const { CategoryRepository, CategoryModel } = CategorySequelize;

describe("DeleteCategoryUseCase Integration Tests", () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelize.CategoryRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategoryRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it("should throws error when entity not found", async () => {
    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.value })).rejects.toThrow(
      new NotFoundError(uuid.value, Category)
    );
  });

  it("should delete a category", async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await useCase.execute({
      id: category.category_id.value,
    });
    const noHasModel = await CategoryModel.findByPk(category.category_id.value);
    expect(noHasModel).toBeNull();
  });
});
