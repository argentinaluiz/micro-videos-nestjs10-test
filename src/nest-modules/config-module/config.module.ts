import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

const joiJson = Joi.extend((joi) => {
  return {
    type: 'object',
    base: joi.object(),
    coerce(value, _schema) {
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (err) {
        console.log(err);
      }
    },
  };
});

type DB_SCHEMA_TYPE = {
  DB_VENDOR: 'mysql' | 'sqlite';
  DB_HOST: string;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid('mysql', 'sqlite'),
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().integer().when('DB_VENDOR', {
    is: 'mysql',
    then: Joi.required(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};

type CONFIG_GOOGLE_SCHEMA_TYPE = {
  GOOGLE_CLOUD_CREDENTIALS: object;
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const CONFIG_GOOGLE_SCHEMA: Joi.StrictSchemaMap<CONFIG_GOOGLE_SCHEMA_TYPE> =
  {
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
    GOOGLE_CLOUD_CREDENTIALS: joiJson.object().required(),
  };

type CONFIG_REDIS_SCHEMA_TYPE = {
  REDIS_URL: string;
};

export const CONFIG_REDIS_SCHEMA: Joi.StrictSchemaMap<CONFIG_REDIS_SCHEMA_TYPE> =
  {
    REDIS_URL: Joi.string().required(),
  };

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE & CONFIG_GOOGLE_SCHEMA_TYPE;

type CONFIG_RABBITMQ_SCHEMA_TYPE = {
  RABBITMQ_URL: string;
};

export const CONFIG_RABBITMQ_SCHEMA: Joi.StrictSchemaMap<CONFIG_RABBITMQ_SCHEMA_TYPE> =
  {
    RABBITMQ_URL: Joi.string().required(),
  };

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const { envFilePath, ...otherOptions } = options;

    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
        join(__dirname, `../../../envs/.env.${process.env.NODE_ENV}`),
        join(__dirname, '../../../envs/.env'),
        // join(process.cwd(), `/envs/.env.${process.env.NODE_ENV}`),
        // join(process.cwd(), '/envs/.env'),
      ],
      validationSchema: joiJson.object({
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_GOOGLE_SCHEMA,
        ...CONFIG_REDIS_SCHEMA,
        ...CONFIG_RABBITMQ_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
