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
    const entity = CastMember.create({
      ...input,
      type,
    });
    const notification = entity.notification;
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.castMemberRepo.insert(entity);
    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberInput = {
  name: string;
  type: CastMemberTypes;
};

export type CreateCastMemberOutput = CastMemberOutput;
