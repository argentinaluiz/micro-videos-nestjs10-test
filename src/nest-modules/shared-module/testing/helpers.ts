import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { AppModule } from '../../../app.module';
import { migrator } from '../../../core/shared/infra/db/sequelize/migrator';
import { applyGlobalConfig } from '../../../global-config';
import { UnitOfWorkSequelize } from '../../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
// import { RabbitmqModule } from '../../rabbitmq-module/rabbitmq-module';
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export function startApp({
  beforeInit,
}: { beforeInit?: (app: INestApplication) => void } = {}) {
  let _app: INestApplication;

  beforeEach(async () => {
    console.warn = jest.fn();
    const moduleBuilder: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize as any);
        },
        inject: [getConnectionToken()],
      })
      .compile();

    const sequelize = moduleBuilder.get<Sequelize>(getConnectionToken());

    await sequelize.sync({ force: true });

    _app = moduleBuilder.createNestApplication();
    applyGlobalConfig(_app);
    beforeInit && beforeInit(_app);
    await _app.init();
  });
  //

  afterEach(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}

export function generateToken(nestApp: INestApplication, isAdmin = true) {
  const jwtService = nestApp.get(JwtService);
  return jwtService.sign(
    isAdmin
      ? {
          realm_access: {
            roles: ['admin-catalog'],
          },
        }
      : {},
  );
}

export function generateAuthBearer(nestApp: INestApplication, isAdmin = true) {
  return `Bearer ${generateToken(nestApp, isAdmin)}`;
}
