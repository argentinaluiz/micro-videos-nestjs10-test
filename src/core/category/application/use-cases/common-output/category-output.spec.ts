import { Category } from '../../../domain/category.aggregate';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutputMapper Unit Tests', () => {
  it('should convert a category in output', () => {
    const aggregate = Category.create({
      name: 'Movie',
      description: 'some description',
      is_active: true,
    });
    const spyToJSON = jest.spyOn(aggregate, 'toJSON');
    const output = CategoryOutputMapper.toOutput(aggregate);
    expect(spyToJSON).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: aggregate.category_id.id,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: aggregate.created_at,
    });
  });
});
