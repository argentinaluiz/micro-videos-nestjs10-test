import request from 'supertest';
import { CategoriesController } from '../../src/categories/categories.controller';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '../../src/shared/testing/helpers';
import { CategoryRepository } from '../../src/core/category/domain/category.repository';
import { Category } from '../../src/core/category/domain/category.entity';
import { CategoryFixture } from '../../src/categories/testing/category-fixtures';
import * as CategoryProviders from '../../src/categories/categories.providers';
import { CategoryOutputMapper } from '../../src/core/category/application/dto/category-output';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();
  describe('/categories/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a category ', async () => {
      const categoryRepo = nestApp.app.get<CategoryRepository>(
        CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().build();
      categoryRepo.insert(category);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/categories/${category.category_id.id}`)
        .expect(200);
      const keyInResponse = CategoryFixture.keysInResponse();
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CategoriesController.serialize(
        CategoryOutputMapper.toOutput(category),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
