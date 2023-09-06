import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { Entity } from '../../shared/domain/entity';
import GenreValidatorFactory from './genre.validator';
import { GenreFakeBuilder } from './genre-fake.builder';
import { CategoryId } from '../../category/domain/category.aggregate';
import { AggregateRoot } from '../../shared/domain/aggregate-root';

export type GenreConstructorProps = {
  genre_id?: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active?: boolean;
  created_at?: Date;
};

export type GenreCreateCommand = {
  name: string;
  categories_id: CategoryId[];
  is_active?: boolean;
};

export class GenreId extends Uuid {}

export class Genre extends AggregateRoot {
  genre_id: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active: boolean;
  created_at: Date;

  constructor(props: GenreConstructorProps) {
    super();
    this.genre_id = props.genre_id ?? new GenreId();
    this.name = props.name;
    this.categories_id = props.categories_id;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: GenreCreateCommand) {
    const genre = new Genre({
      ...props,
      categories_id: !props.categories_id
        ? null
        : new Map(props.categories_id.map((id) => [id.id, id])),
    });
    genre.validate(['name', 'categories_id', 'is_active']);
    return genre;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categories_id.set(categoryId.id, categoryId);
    this.validate(['categories_id']);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categories_id.delete(categoryId.id);
    this.validate(['categories_id']);
  }

  syncCategoriesId(categoriesId: CategoryId[]): void {
    if (!this.categories_id) {
      return;
    }
    this.categories_id = !categoriesId
      ? null
      : new Map(categoriesId.map((id) => [id.id, id]));
    this.validate(['categories_id']);
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  validate(fields?: string[]) {
    const validator = GenreValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  get entity_id() {
    return this.genre_id;
  }

  toJSON() {
    return {
      genre_id: this.genre_id.id,
      name: this.name,
      categories_id: Array.from(this.categories_id.values()).map((id) => id.id),
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
