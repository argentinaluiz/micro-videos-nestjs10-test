import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { UnitOfWorkFakeInMemory } from '../../../../../shared/infra/db/in-memory/fake-unit-work-in-memory';
import { CastMemberTypes } from '../../../../domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '../../../../domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { UpdateCastMemberInput } from '../update-cast-member.input';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';

describe('UpdateCastMemberUseCase Unit Tests', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository(new UnitOfWorkFakeInMemory());
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    const castMemberId = new CastMemberId();

    await expect(() =>
      useCase.execute(
        new UpdateCastMemberInput({ id: castMemberId.id, name: 'fake' }),
      ),
    ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
  });

  it('should update a cast member', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const aggregate = CastMember.fake().anActor().build();
    repository.items = [aggregate];

    let output = await useCase.execute(
      new UpdateCastMemberInput({
        id: aggregate.cast_member_id.id,
        name: 'test',
      }),
    );
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: aggregate.cast_member_id.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: aggregate.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name?: string;
        type?: CastMemberTypes;
      };
      expected: {
        id: string;
        name: string;
        type: CastMemberTypes;
        created_at: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: aggregate.entity_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: aggregate.entity_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          created_at: aggregate.created_at,
        },
      },
      {
        input: {
          id: aggregate.entity_id.id,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: aggregate.entity_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          created_at: aggregate.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute(
        new UpdateCastMemberInput({
          id: i.input.id,
          ...('name' in i.input && { name: i.input.name }),
          ...('type' in i.input && { type: i.input.type }),
        }),
      );
      expect(output).toStrictEqual({
        id: aggregate.entity_id.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: i.expected.created_at,
      });
    }
  });
});
