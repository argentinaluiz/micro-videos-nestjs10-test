import { IsInstance, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { CastMember } from './cast-member.entity';
import { CastMemberType } from './cast-member-type.vo';

export class CastMemberRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInstance(CastMemberType)
  @IsNotEmpty()
  type: CastMemberType;

  constructor({ name, type }: CastMember) {
    Object.assign(this, { name, type });
  }
}

export class CastMemberValidator extends ClassValidatorFields<CastMemberRules> {
  validate(data: CastMember): boolean {
    return super.validate(new CastMemberRules(data ?? ({} as any)));
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}

export default CastMemberValidatorFactory;
