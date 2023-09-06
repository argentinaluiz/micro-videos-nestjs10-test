import { Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from '../config-module/config.module';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category-sequelize';
import { CastMemberModel } from '../../core/cast-member/infra/db/sequelize/cast-member-sequelize';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/db/sequelize/genre-sequelize';

const models = [CategoryModel, CastMemberModel, GenreModel, GenreCategoryModel];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async (config: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        if (config.get('DB_VENDOR') === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: config.get('DB_HOST'),
            models,
            autoLoadModels: config.get('DB_AUTO_LOAD_MODELS'),
            logging: config.get('DB_LOGGING'),
          };
        }

        if (config.get('DB_VENDOR') === 'mysql') {
          return {
            dialect: 'mysql',
            host: config.get('DB_HOST'),
            database: config.get('DB_DATABASE'),
            username: config.get('DB_USERNAME'),
            password: config.get('DB_PASSWORD'),
            port: config.get('DB_PORT'),
            models,
            autoLoadModels: config.get('DB_AUTO_LOAD_MODELS'),
            logging: config.get('DB_LOGGING'),
          };
        }

        throw new Error('Unsupported database config');
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
    },
  ],
})
export class DatabaseModule {}
