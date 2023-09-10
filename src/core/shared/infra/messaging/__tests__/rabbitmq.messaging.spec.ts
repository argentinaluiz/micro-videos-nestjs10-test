import { ChannelWrapper } from 'amqp-connection-manager';
import { IIntegrationEvent } from '../../../domain/events/integration-event.interface';
import { RabbitMQMessaging } from '../rabbitmq.messaging';
import { MessageIntegrationEventsMap } from '../messaging-integration-events-map';

describe('RabbitMQMessaging Unit tests', () => {
  let service: RabbitMQMessaging;
  let connection: ChannelWrapper;
  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    service = new RabbitMQMessaging(connection as any);
  });

  describe('publish', () => {
    it('should publish the integration event to the channel', async () => {
      const integrationEvent: IIntegrationEvent = {
        event_name: 'test',
        occurred_on: new Date(),
        event_version: 1,
        payload: {
          test: 'test',
        },
      };

      await service.publish(integrationEvent);

      expect(connection.publish).toBeCalledWith(
        MessageIntegrationEventsMap[integrationEvent.event_name].exchange,
        MessageIntegrationEventsMap[integrationEvent.event_name].routing_key,
        integrationEvent,
      );
    });
  });
});
