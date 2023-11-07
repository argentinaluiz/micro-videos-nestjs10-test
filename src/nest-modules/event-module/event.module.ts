import { BullModule, getQueueToken } from '@nestjs/bull';
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { BullIntegrationEventQueue } from '../../core/shared/infra/queue/bull-integration-event.queue';
import { PublishIntegrationEventJob } from './override-core-handlers/publish-integration-events.job';
import { IMessageBusService } from '../../core/shared/application/message-bus.interface';
import { RabbitmqModule } from '../rabbitmq-module/rabbitmq-module';
import { ConfigService } from '@nestjs/config';

export type EventModuleOptions = { enableQueueConsumers: boolean };

export const {
  ConfigurableModuleClass: EventModuleConfigurableClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<EventModuleOptions>().build();

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'integration-events',
    }),
    RabbitmqModule.forFeature(),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: 'IIntegrationEventQueueService', //queue-module
      useFactory: (options: EventModuleOptions, queue: Queue) => {
        return options.enableQueueConsumers
          ? new BullIntegrationEventQueue(queue)
          : null;
      },
      inject: [MODULE_OPTIONS_TOKEN, getQueueToken('integration-events')],
    },
    {
      provide: PublishIntegrationEventJob, //queue-module (depends RabbitMQ)
      useFactory: (messageBus: IMessageBusService) => {
        return new PublishIntegrationEventJob(messageBus);
      },
      inject: ['IMessageBusService'],
    },
  ],
  exports: ['IIntegrationEventQueueService'],
})
export class EventModule extends EventModuleConfigurableClass {
  static register(
    options: typeof OPTIONS_TYPE = { enableQueueConsumers: false },
  ): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return super.registerAsync(options);
  }

  static registerAsyncWithConfig(): DynamicModule {
    return super.registerAsync({
      useFactory: (configService: ConfigService) => ({
        enableQueueConsumers: configService.get<boolean>(
          'QUEUE_CONSUMERS_ENABLED',
        ),
      }),
      inject: [ConfigService],
    });
  }
}
