// FILEPATH: /home/node/app/src/nest-modules/rabbitmq-module/rabbitmq-consumer-error.filter.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQConsumerErrorFilter } from './rabbitmq-consumer-error.filter';
import { ArgumentsHost } from '@nestjs/common';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { EntityValidationError } from '../../core/shared/domain/validators/validation.error';
import { RabbitmqRetriableError } from './rabbitmq-retriable.error';

describe('RabbitMQConsumerErrorFilter', () => {
  let filter: RabbitMQConsumerErrorFilter;
  let amqpConnection: AmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQConsumerErrorFilter,
        { provide: AmqpConnection, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    filter = module.get<RabbitMQConsumerErrorFilter>(
      RabbitMQConsumerErrorFilter,
    );
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should not retry if error is non-retriable', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest
            .fn()
            .mockReturnValue({ properties: { headers: {} } }),
        }),
      } as unknown as ArgumentsHost;

      const error = new RabbitmqRetriableError(
        new EntityValidationError([
          {
            key: ['value'],
          },
        ]),
      );

      const result = await filter.catch(error, host);
      expect(result).toEqual(new Nack(false));
      expect(host.switchToRpc).not.toHaveBeenCalled();
    });

    it('should retry if error is retriable and retry count is less than max retries', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 1 } },
            fields: { routingKey: 'test' },
            content: Buffer.from('test'),
          }),
        }),
      } as unknown as ArgumentsHost;

      await filter.catch(new RabbitmqRetriableError(new Error()), host);
      expect(amqpConnection.publish).toHaveBeenCalled();
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'delay.exchange',
        'test',
        Buffer.from('test'),
        {
          correlationId: undefined,
          headers: {
            'x-retry-count': 2,
            'x-delay': 5000,
          },
        },
      );
    });

    it('should not retry if error is retriable and retry count is greater than max retries', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 3 } },
          }),
        }),
      } as unknown as ArgumentsHost;

      const error = new RabbitmqRetriableError(new Error());
      const result = await filter.catch(error, host);
      expect(result).toEqual(new Nack(false));
    });
  });
});
