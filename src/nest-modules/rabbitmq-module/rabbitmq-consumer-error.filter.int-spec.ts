import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQConsumerErrorFilter } from './rabbitmq-consumer-error.filter';
import { RabbitmqModule } from './rabbitmq-module';
import {
  AmqpConnection,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigModule } from '../config-module/config.module';
import { EntityValidationError } from '../../core/shared/domain/validators/validation.error';
import { join } from 'path';
import { RabbitmqRetriableError } from './rabbitmq-retriable.error';

@Injectable()
class StubConsumer {
  @RabbitSubscribe({
    exchange: 'delay.exchange',
    routingKey: 'test-event',
    queue: 'test-retry-queue',
    allowNonJsonMessages: true,
    queueOptions: {
      durable: false,
    },
  })
  handle() {
    this.throwError();
  }

  throwError() {}
}

describe('RabbitMQConsumerErrorFilter', () => {
  let filter: RabbitMQConsumerErrorFilter;
  let module: TestingModule;
  let subscriber: StubConsumer;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: join(__dirname, '.env.rabbitmq'),
        }),
        RabbitmqModule.forRoot(),
      ],
      providers: [StubConsumer],
    }).compile();

    filter = module.get<RabbitMQConsumerErrorFilter>(
      RabbitMQConsumerErrorFilter,
    );
    subscriber = module.get<StubConsumer>(StubConsumer);

    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should not retry if error is non-retriable', async () => {
    subscriber.throwError = jest.fn().mockImplementation(() => {
      const entityValidationError = new EntityValidationError([
        {
          key: ['value'],
        },
      ]);
      throw new RabbitmqRetriableError(entityValidationError);
    });
    const ampqConnection: AmqpConnection = module.get(AmqpConnection);
    const spyShouldRetry = jest.spyOn(filter, 'shouldRetry' as any);
    const spyHandleMessage = jest.spyOn(ampqConnection, 'handleMessage' as any);

    await ampqConnection.publish('delay.exchange', 'test-event', 'test');

    //sleep
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(spyHandleMessage.mock.results[0].value).resolves.toEqual(
      new Nack(false),
    );
    expect(spyShouldRetry).not.toHaveBeenCalled();
  });

  it('should retry if error is retriable and retry count is less than max retries', async () => {
    subscriber.throwError = jest.fn().mockImplementation(() => {
      throw new RabbitmqRetriableError(new Error());
    });
    const ampqConnection: AmqpConnection = module.get(AmqpConnection);
    const spyShouldRetry = jest.spyOn(filter, 'shouldRetry' as any);
    const spyPublish = jest.spyOn(ampqConnection, 'publish' as any);
    await ampqConnection.publish('delay.exchange', 'test-event', 'test');

    //sleep
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(spyShouldRetry).toHaveBeenCalled();
    expect(spyPublish).toHaveBeenCalledWith(
      'delay.exchange',
      'test-event',
      Buffer.from(JSON.stringify('test')),
      {
        correlationId: undefined,
        headers: {
          'x-retry-count': 1,
          'x-delay': 5000,
        },
      },
    );
  });

  it('should not retry if error is retriable and retry count is greater than max retries', async () => {
    subscriber.throwError = jest.fn().mockImplementation(() => {
      throw new RabbitmqRetriableError(new Error());
    });
    const ampqConnection: AmqpConnection = module.get(AmqpConnection);
    const spyShouldRetry = jest.spyOn(filter, 'shouldRetry' as any);
    const spyHandleMessage = jest.spyOn(ampqConnection, 'handleMessage' as any);
    await ampqConnection.publish('delay.exchange', 'test-event', 'test', {
      headers: {
        'x-retry-count': 3,
      },
    });

    //sleep
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(spyShouldRetry).toHaveBeenCalled();
    expect(spyHandleMessage.mock.results[0].value).resolves.toEqual(
      new Nack(false),
    );
  });
});
