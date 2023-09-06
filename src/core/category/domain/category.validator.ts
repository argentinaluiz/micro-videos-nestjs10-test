import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { Category } from './category.aggregate';
import { Notification } from '../../shared/domain/validators/notification';

export class CategoryRules {
  @MaxLength(255, { groups: ['name'] })
  @IsString({ groups: ['name'] })
  @IsNotEmpty({ groups: ['name'] })
  name: string;

  @IsString({ groups: ['description'] })
  @IsOptional({ groups: ['description'] })
  description: string;

  @IsBoolean({ groups: ['is_active'] })
  @IsOptional({ groups: ['is_active'] })
  is_active: boolean;

  constructor(aggregate: Category) {
    Object.assign(this, aggregate);
  }
}

export class CategoryValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length
      ? fields
      : ['name', 'description', 'is_active'];
    return super.validate(notification, new CategoryRules(data), newFields);
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}

export default CategoryValidatorFactory;
