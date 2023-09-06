import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AggregateValidationErrorFilter } from './aggregate-validation-error.filter';
import request from 'supertest';
import { AggregateValidationError } from '../../../core/shared/domain/validators/validation.error';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new AggregateValidationError([
      {
        field1: ['field1 is required'],
      },
      {
        field2: ['field2 is required'],
      },
    ]);
  }
}

describe('AggregateValidationErrorFilter Unit Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AggregateValidationErrorFilter());
    await app.init();
  });

  it('should catch a AggregateValidationError', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: ['field1 is required', 'field2 is required'],
      });
  });
});
