import { IUseCase } from '../../../shared/application/use-case-interface';
import { CastMemberRepository } from '../../domain/cast-member.repository';
import { CastMember } from '../../domain/cast-member.entity';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../dto/cast-member-output';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../domain/cast-member-type.vo';
import { EntityValidationError } from '../../../shared/domain/validators/validation.error';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private castMemberRepo: CastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CastMemberOutput> {
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();
    try {
      const entity = CastMember.create({
        ...input,
        type,
      });
      await this.castMemberRepo.insert(entity);
      return CastMemberOutputMapper.toOutput(entity);
    } catch (e) {
      this.handleError(e, errorCastMemberType);
    }
  }

  private handleError(e: Error, errorCastMemberType: Error | undefined) {
    if (e instanceof EntityValidationError) {
      e.setFromError('type', errorCastMemberType);
    }

    throw e;
  }
}

export type CreateCastMemberInput = {
  name: string;
  type: CastMemberTypes;
};

export type CreateCastMemberOutput = CastMemberOutput;
