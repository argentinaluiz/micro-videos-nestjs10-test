import { IsInstance, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { CastMember } from './cast-member.aggregate';
import { CastMemberType } from './cast-member-type.vo';
import { Notification } from '../../shared/domain/validators/notification';

export class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  @IsString({ groups: ['name'] })
  @IsNotEmpty({ groups: ['name'] })
  name: string;

  @IsInstance(CastMemberType, { groups: ['type'] })
  @IsNotEmpty({ groups: ['type'] })
  type: CastMemberType;

  constructor(aggregate: CastMember) {
    Object.assign(this, aggregate);
  }
}

export class CastMemberValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    data: CastMember,
    fields: string[],
  ): boolean {
    const newFields = fields?.length ? fields : ['name', 'type'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}

export default CastMemberValidatorFactory;
