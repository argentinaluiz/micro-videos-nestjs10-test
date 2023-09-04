import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Entity } from '../../shared/domain/entity';
import CastMemberValidatorFactory from './cast-member.validator';
import { EntityValidationError } from '../../shared/domain/validators/validation.error';
import { CastMemberType } from './cast-member-type.vo';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';

export type CastMemberConstructorProps = {
  cast_member_id?: Uuid;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export type CastMemberCreateCommand = {
  name: string;
  type: CastMemberType;
};

export class CastMember extends Entity {
  cast_member_id: Uuid;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.cast_member_id = props.cast_member_id ?? new Uuid();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CastMemberCreateCommand) {
    const castMember = new CastMember(props);
    CastMember.validate(castMember);
    return castMember;
  }

  changeName(name: string): void {
    this.name = name;
    CastMember.validate(this);
  }

  changeType(type: CastMemberType): void {
    this.type = type;
    CastMember.validate(this);
  }

  static validate(entity: CastMember) {
    const validator = CastMemberValidatorFactory.create();
    const isValid = validator.validate(entity);
    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  static fake() {
    return CastMemberFakeBuilder;
  }

  get entity_id() {
    return this.cast_member_id;
  }

  toJSON() {
    return {
      cast_member_id: this.cast_member_id.id,
      name: this.name,
      type: this.type.type,
      created_at: this.created_at,
    };
  }
}
