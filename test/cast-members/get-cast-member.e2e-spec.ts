import request from 'supertest';
import { CastMembersController } from '../../src/cast-members/cast-members.controller';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '../../src/shared/testing/helpers';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { CastMemberFixture } from '../../src/cast-members/testing/cast-member-fixtures';
import * as CastMemberProviders from '../../src/cast-members/cast-members.providers';
import { CastMemberOutputMapper } from '../../src/core/cast-member/application/dto/cast-member-output';

describe('CastMembersController (e2e)', () => {
  const nestApp = startApp();
  describe('/cast-members/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a cast-member ', async () => {
      const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
        CastMemberProviders.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().anActor().build();
      castMemberRepo.insert(castMember);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/cast-members/${castMember.cast_member_id.id}`)
        .expect(200);
      const keyInResponse = CastMemberFixture.keysInResponse();
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
