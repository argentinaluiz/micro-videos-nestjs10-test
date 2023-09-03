import { CategoryFakeBuilder } from './testing/category-fake.builder';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Entity } from '../../shared/domain/entity';
//import ValidatorRules from "../../shared/domain/validators/validator-rules";
import CategoryValidatorFactory from './category.validator';
import { EntityValidationError } from '../../shared/domain/validators/validation.error';

export type CategoryConstructorProps = {
  category_id?: Uuid;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
};

export type CategoryCreateCommand = {
  name: string;
  description?: string;
  is_active?: boolean;
};

export class Category extends Entity {
  category_id: Uuid;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    super();
    this.category_id = props.category_id ?? new Uuid();
    this.name = props.name;
    this.description = props.description || null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CategoryCreateCommand) {
    const category = new Category(props);
    Category.validate(category);
    return category;
  }

  changeName(name: string): void {
    this.name = name;
    Category.validate(this);
  }

  changeDescription(description: string | null): void {
    this.description = description;
    Category.validate(this);
  }

  // static validate(entity: Category) {
  //   ValidatorRules.values(entity.name, "name").required().string().maxLength(255);
  //   ValidatorRules.values(entity.description, "description").string();
  //   ValidatorRules.values(entity.is_active, "is_active").boolean();
  // }

  static validate(entity: Category) {
    const validator = CategoryValidatorFactory.create();
    const isValid = validator.validate(entity);
    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  get entity_id() {
    return this.category_id;
  }

  toJSON() {
    return {
      category_id: this.category_id.id,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
