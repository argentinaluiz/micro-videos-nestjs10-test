import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import * as CategoryProviders from './categories.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '../core/category/infra/db/sequelize/category-sequelize';
@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [
    ...Object.values(CategoryProviders.REPOSITORIES),
    ...Object.values(CategoryProviders.USE_CASES),
  ],
})
export class CategoriesModule {}
