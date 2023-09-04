import { IUseCase } from '../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMember } from '../../domain/cast-member.entity';
import { CastMemberRepository } from '../../domain/cast-member.repository';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../dto/cast-member-output';

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberInput, GetCastMemberOutput>
{
  constructor(private categoryRepo: CastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<GetCastMemberOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepo.findById(uuid);
    if (!category) {
      throw new NotFoundError(input.id, CastMember);
    }

    return CastMemberOutputMapper.toOutput(category);
  }
}

export type GetCastMemberInput = {
  id: string;
};

export type GetCastMemberOutput = CastMemberOutput;
