import { IUseCase } from '../../../shared/application/use-case-interface';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberRepository } from '../../domain/cast-member.repository';

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private castMemberRepository: CastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<DeleteCastMemberOutput> {
    const uuid = new Uuid(input.id);
    await this.castMemberRepository.delete(uuid);
  }
}

export type DeleteCastMemberInput = {
  id: string;
};

type DeleteCastMemberOutput = void;
