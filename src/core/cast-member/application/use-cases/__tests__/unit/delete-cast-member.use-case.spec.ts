import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import InvalidUuidError from '../../../../../shared/domain/value-objects/uuid.vo';
import {
  CastMember,
  CastMemberId,
} from '../../../../domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from '../../delete-cast-member.use-case';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError('fake id'),
    );

    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute({ id: castMemberId.id }),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should delete a cast member', async () => {
    const items = [CastMember.fake().anActor().build()];
    repository.items = items;
    await useCase.execute({
      id: items[0].cast_member_id.id,
    });
    expect(repository.items).toHaveLength(0);
  });
});
