import { IMessageBusService } from '../../application/message-bus.interface';
import { IIntegrationEvent } from '../../domain/events/integration-event.interface';

export class InMemoryMessaging implements IMessageBusService {
  private handlers: { [key: string]: (event: IIntegrationEvent) => void } = {};

  async publish(event: IIntegrationEvent) {
    const handler = this.handlers[event.constructor.name];
    if (handler) {
      handler(event);
    }
  }

  //   public subscribe<T extends IIntegrationEvent>(
  //     event: { new (...args: any[]): T },
  //     handler: (event: T) => void,
  //   ): void {
  //     this.handlers[event.name] = handler;
  //   }

  //   public unsubscribe<T extends IIntegrationEvent>(event: {
  //     new (...args: any[]): T;
  //   }): void {
  //     delete this.handlers[event.name];
  //   }
}
