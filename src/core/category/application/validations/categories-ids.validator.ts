import { ValidatorAppInterface } from '../../../@seedwork/application/validators/validator-app-interface';
import { Either } from '../../../shared/domain/either';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import InvalidUuidError from '../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../domain/category.aggregate';
import { ICategoryRepository } from '../../domain/category.repository';

export class CategoriesIdsValidator implements ValidatorAppInterface {
  constructor(private categoryRepo: ICategoryRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<CategoryId[], InvalidUuidError[] | NotFoundError[]>> {
    const eitherResult = Either.of(categories_id)
      .map((value) => (Array.isArray(value) ? value : []))
      .chainEach<CategoryId[], InvalidUuidError[]>((id) => {
        return Either.safe(() => new CategoryId(id));
      });

    if (eitherResult.isFail()) {
      return eitherResult;
    }

    if (eitherResult.ok.length === 0) {
      return Either.fail([new NotFoundError('undefined', Category)]);
    }

    const existsResults = await this.categoryRepo.existsById(eitherResult.ok);
    return existsResults.not_exists.length > 0
      ? Either.fail(
          existsResults.not_exists.map(
            (c) => new NotFoundError(c.id, Category),
          ),
        )
      : eitherResult;
  }
}
