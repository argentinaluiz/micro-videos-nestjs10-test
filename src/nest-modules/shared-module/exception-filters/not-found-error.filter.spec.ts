import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundErrorFilter } from './not-found-error.filter';
import request from 'supertest';
import { Entity } from '../../../core/shared/domain/entity';
import { NotFoundError } from '../../../core/shared/domain/errors/not-found.error';
import { AggregateRoot } from '../../../core/shared/domain/aggregate-root';

class StubAggregate extends AggregateRoot {
  entity_id: any;
  toJSON(): Required<any> {
    return {};
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('fake id', StubAggregate);
  }
}

describe('NotFoundErrorFilter Unit Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new NotFoundErrorFilter());
    await app.init();
  });

  it('should catch a EntityValidationError', () => {
    return request(app.getHttpServer()).get('/stub').expect(404).expect({
      statusCode: 404,
      error: 'Not Found',
      message: 'StubEntity Not Found using ID fake id',
    });
  });
});
