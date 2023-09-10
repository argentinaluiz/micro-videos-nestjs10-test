import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { IMessageBusService } from '../../application/message-bus-interface';
import { IIntegrationEvent } from '../../domain/events/integration-event.interface';
import { MessageIntegrationEventsMap } from './messaging-integration-events-map';

export class RabbitMQMessaging implements IMessageBusService {
  constructor(private connection: AmqpConnection) {}
  async publish(event: IIntegrationEvent) {
    console.log(event);
    const config = MessageIntegrationEventsMap[event.event_name];
    await this.connection.publish(config.exchange, config.routing_key, event);
  }
}
