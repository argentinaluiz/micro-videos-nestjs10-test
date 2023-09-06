import request from 'supertest';
import { CategoriesController } from '../../src/categories/categories.controller';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { startApp } from '../../src/shared/testing/helpers';
import { ListCategoriesFixture } from '../../src/categories/testing/category-fixtures';
import { CategoryOutputMapper } from '../../src/core/category/application/dto/category-output';
import * as CategoryProviders from '../../src/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  describe('/categories (GET)', () => {
    describe('should return categories sorted by created_at when request query is empty', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return categories using paginate, filter and sort', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange[0]])(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
