import { IUseCase } from '../../../shared/application/use-case-interface';
import { ICastMemberRepository } from '../../domain/cast-member.repository';
import { CastMember } from '../../domain/cast-member.aggregate';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../dto/cast-member-output';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../domain/cast-member-type.vo';
import { AggregateValidationError } from '../../../shared/domain/validators/validation.error';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CastMemberOutput> {
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();
    const aggregate = CastMember.create({
      ...input,
      type,
    });
    const notification = aggregate.notification;
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new AggregateValidationError(notification.toJSON());
    }

    await this.castMemberRepo.insert(aggregate);
    return CastMemberOutputMapper.toOutput(aggregate);
  }
}

export type CreateCastMemberInput = {
  name: string;
  type: CastMemberTypes;
};

export type CreateCastMemberOutput = CastMemberOutput;
