import { IUseCase } from '../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../domain/cast-member-type.vo';
import { CastMember } from '../../domain/cast-member.entity';
import { CastMemberRepository } from '../../domain/cast-member.repository';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../dto/cast-member-output';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private categoryRepo: CastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const uuid = new Uuid(input.id);
    const castMember = await this.categoryRepo.findById(uuid);

    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    input.name && castMember.changeName(input.name);
    if ('type' in input) {
      const [type, errorCastMemberType] = CastMemberType.create(input.type).asArray();
      castMember.changeType(type);
    }

    await this.categoryRepo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberInput = {
  id: string;
  name?: string;
  type?: CastMemberTypes;
  is_active?: boolean;
};

export type UpdateCastMemberOutput = CastMemberOutput;
