import { MaxLength } from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { Genre } from './genre.aggregate';
import { Notification } from '../../shared/domain/validators/notification';

export class GenreRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(aggregate: Genre) {
    Object.assign(this, aggregate);
  }
}

export class GenreValidator extends ClassValidatorFields {
  validate(notification: Notification, data: Genre, fields: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new GenreRules(data), newFields);
  }
}

export class GenreValidatorFactory {
  static create() {
    return new GenreValidator();
  }
}

export default GenreValidatorFactory;
