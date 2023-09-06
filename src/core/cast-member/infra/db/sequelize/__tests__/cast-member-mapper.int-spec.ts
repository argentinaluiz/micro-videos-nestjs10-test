import { LoadAggregateError } from '../../../../../shared/domain/validators/validation.error';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../../../domain/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '../../../../domain/cast-member.aggregate';
import * as CastMemberSequelize from '../cast-member-sequelize';

const { CastMemberModel, CastMemberModelMapper } = CastMemberSequelize;

describe('CastMemberModelMapper Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  it('should throws error when cast member is invalid', () => {
    const model = CastMemberModel.build({
      cast_member_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
    });
    try {
      CastMemberModelMapper.toAggregate(model);
      fail(
        'The cast member is valid, but it needs throws a LoadAggregateError',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(LoadAggregateError);
      expect((e as LoadAggregateError).error).toMatchObject([
        {
          name: [
            'name should not be empty',
            'name must be a string',
            'name must be shorter than or equal to 255 characters',
          ],
        },
        { type: ['Invalid cast member type: undefined'] },
      ]);
    }
  });

  it('should convert a cast member model to a cast member aggregate', () => {
    const created_at = new Date();
    const model = CastMemberModel.build({
      cast_member_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      type: CastMemberTypes.ACTOR,
      created_at,
    });
    const aggregate = CastMemberModelMapper.toAggregate(model);
    expect(aggregate.toJSON()).toStrictEqual(
      new CastMember({
        cast_member_id: new CastMemberId(
          '5490020a-e866-4229-9adc-aa44b83234c4',
        ),
        name: 'some value',
        type: CastMemberType.createAnActor(),
        created_at,
      }).toJSON(),
    );
  });
});
