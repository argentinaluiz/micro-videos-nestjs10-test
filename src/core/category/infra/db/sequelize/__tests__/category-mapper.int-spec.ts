import { LoadAggregateError } from '../../../../../shared/domain/validators/validation.error';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { Category, CategoryId } from '../../../../domain/category.aggregate';
import * as CategorySequelize from '../category-sequelize';

const { CategoryModel, CategoryModelMapper } = CategorySequelize;

describe('CategoryModelMapper Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should throws error when category is invalid', () => {
    const model = CategoryModel.build({
      category_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
    });
    try {
      CategoryModelMapper.toAggregate(model);
      fail('The category is valid, but it needs throws a LoadAggregateError');
    } catch (e) {
      expect(e).toBeInstanceOf(LoadAggregateError);
      expect((e as LoadAggregateError).error).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  it('should convert a category model to a category aggregate', () => {
    const created_at = new Date();
    const model = CategoryModel.build({
      category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      description: 'some description',
      is_active: true,
      created_at,
    });
    const aggregate = CategoryModelMapper.toAggregate(model);
    expect(aggregate.toJSON()).toStrictEqual(
      new Category({
        category_id: new CategoryId('5490020a-e866-4229-9adc-aa44b83234c4'),
        name: 'some value',
        description: 'some description',
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });
});
