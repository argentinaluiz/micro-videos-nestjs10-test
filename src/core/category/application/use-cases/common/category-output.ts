import { Category } from '../../../domain/category.aggregate';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(aggregate: Category): CategoryOutput {
    const { category_id, ...other_props } = aggregate.toJSON();
    return {
      id: category_id,
      ...other_props,
    };
  }
}
