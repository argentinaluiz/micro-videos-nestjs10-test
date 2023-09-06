import request from 'supertest';
import { CastMembersController } from '../../src/cast-members/cast-members.controller';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '../../src/shared/testing/helpers';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { UpdateCastMemberFixture } from '../../src/cast-members/testing/cast-member-fixtures';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import * as CastMemberProviders from '../../src/cast-members/cast-members.providers';
import { CastMemberOutputMapper } from '../../src/core/cast-member/application/dto/cast-member-output';
import { Uuid } from '../../src/core/shared/domain/value-objects/uuid.vo';

describe('CastMembersController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/cast-members/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = CastMember.fake().anActor();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          send_data: { name: faker.name },
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, send_data, expected }) => {
          return request(nestApp.app.getHttpServer())
            .patch(`/cast-members/${id}`)
            .send(send_data)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp({
        beforeInit: (app) => {
          app['config'].globalPipes = [];
        },
      });
      const validationError =
        UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let categoryRepo: ICastMemberRepository;

      beforeEach(() => {
        categoryRepo = app.app.get<ICastMemberRepository>(
          CastMemberProviders.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = CastMember.fake().anActor().build();
        await categoryRepo.insert(category);
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${category.cast_member_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a category', () => {
      const app = startApp();
      const arrange = UpdateCastMemberFixture.arrangeForUpdate();
      let categoryRepo: ICastMemberRepository;

      beforeEach(async () => {
        categoryRepo = app.app.get<ICastMemberRepository>(
          CastMemberProviders.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const castMemberCreated = CastMember.fake().anActor().build();
          await categoryRepo.insert(castMemberCreated);

          const res = await request(app.app.getHttpServer())
            .patch(`/cast-members/${castMemberCreated.cast_member_id.id}`)
            .send(send_data)
            .expect(200);
          const keyInResponse = UpdateCastMemberFixture.keysInResponse();
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const categoryUpdated = await categoryRepo.findById(new Uuid(id));
          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toOutput(categoryUpdated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            name: expected.name ?? castMemberCreated.name,
            type: expected.type ?? castMemberCreated.type.type,
          });
        },
      );
    });
  });
});
