import {
  IsBoolean,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { Genre } from './genre.aggregate';
import { Notification } from '../../shared/domain/validators/notification';
import { CategoryId } from '../../category/domain/category.aggregate';
import { IterableNotEmpty } from '../../shared/domain/validators/rules/iterable-not-empty.rule';

export class GenreRules {
  @MaxLength(255, { groups: ['name'] })
  @IsString({ groups: ['name'] })
  @IsNotEmpty({ groups: ['name'] })
  name: string;

  @IsInstance(CategoryId, { each: true, groups: ['categories_id'] })
  @IterableNotEmpty({ groups: ['categories_id'] })
  categories_id: Map<string, CategoryId>;

  @IsBoolean({ groups: ['is_active'] })
  @IsOptional({ groups: ['is_active'] })
  is_active: boolean;

  constructor(aggregate: Genre) {
    Object.assign(this, aggregate);
  }
}

export class GenreValidator extends ClassValidatorFields {
  validate(notification: Notification, data: Genre, fields: string[]): boolean {
    const newFields = fields?.length
      ? fields
      : ['name', 'categories_id', 'is_active'];
    return super.validate(notification, new GenreRules(data), newFields);
  }
}

export class GenreValidatorFactory {
  static create() {
    return new GenreValidator();
  }
}

export default GenreValidatorFactory;
