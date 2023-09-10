import { Channel } from 'amqplib';
import { Config } from '../../config';
import { RabbitMQMessaging } from '../rabbitmq.messaging';
import { IIntegrationEvent } from '../../../domain/events/integration-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('RabbitMQMessaging Integration Tests', () => {
  let service: RabbitMQMessaging;
  let connection: AmqpConnection;
  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUrl(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        log: () => {},
      } as any,
    });
    await connection.init();
    const channel = connection.channel;

    await channel.assertExchange('test-exchange', 'topic', {
      durable: false,
    });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'test-event');
  });

  afterEach(async () => {
    try {
      await connection.connection.close();
    } catch (err) {}
  });

  describe('publish', () => {
    it('should publish the integration event to the channel', (done) => {
      const integrationEvent: IIntegrationEvent = {
        event_name: 'test',
        occurred_on: new Date(),
        event_version: 1,
        payload: {
          test: 'test',
        },
      };

      service = new RabbitMQMessaging(connection);
      service.publish(integrationEvent).then(() => {
        connection.channel.consume('test-queue', (msg) => {
          connection.channel.ack(msg);
          done();
        });
      });
    });
  });
});
