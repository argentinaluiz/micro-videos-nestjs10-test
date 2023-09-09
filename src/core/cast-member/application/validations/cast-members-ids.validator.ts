import { Either } from '../../../shared/domain/either';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { CastMember, CastMemberId } from '../../domain/cast-member.aggregate';
import { ICastMemberRepository } from '../../domain/cast-member.repository';

export class CastMembersIdsValidator {
  constructor(private categoryRepo: ICastMemberRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<CastMemberId[], NotFoundError[]>> {
    const categoriesId = categories_id.map((id) => new CastMemberId(id));

    const existsResults = await this.categoryRepo.existsById(categoriesId);
    return existsResults.not_exists.length > 0
      ? Either.fail(
          existsResults.not_exists.map(
            (c) => new NotFoundError(c.id, CastMember),
          ),
        )
      : Either.ok(categoriesId);
  }
}
