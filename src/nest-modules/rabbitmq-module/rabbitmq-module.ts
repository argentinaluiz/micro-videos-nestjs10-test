import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQMessaging } from '../../core/shared/infra/messaging/rabbitmq.messaging';
import { APP_FILTER } from '@nestjs/core';
import { RabbitMQConsumerErrorFilter } from './rabbitmq-consumer-error.filter';
import { CreateDlxQueueService } from './create-dlx-queue.service';

// @Module({
//   imports: [
//     RabbitMQModule.forRootAsync(RabbitMQModule, {
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get('RABBITMQ_URL'),
//         connectionInitOptions: { wait: false },
//         registerHandlers: configService.get('RABBITMQ_REGISTER_HANDLERS'),
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [
//     {
//       provide: 'IMessageBusService', //rabbitmq-module
//       useFactory: (amqpConnection: AmqpConnection) => {
//         return new RabbitMQMessaging(amqpConnection);
//       },
//       inject: [AmqpConnection],
//     },
//   ],
//   exports: [RabbitMQModule, 'IMessageBusService'],
// })
export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('RABBITMQ_URL'),
            connectionInitOptions: { wait: true },
            registerHandlers: configService.get('RABBITMQ_REGISTER_HANDLERS'),
            exchanges: [
              {
                name: 'delay.exchange',
                type: 'x-delayed-message',
                options: {
                  durable: true,
                  autoDelete: false,
                  arguments: {
                    'x-delayed-type': 'direct',
                  },
                },
              },
              {
                name: 'dlx.exchange',
                type: 'topic',
                options: {
                  durable: true,
                  autoDelete: false,
                },
              },
            ],
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        CreateDlxQueueService,
        RabbitMQConsumerErrorFilter,
        {
          provide: APP_FILTER,
          useExisting: RabbitMQConsumerErrorFilter,
        },
      ],
      global: true,
      exports: [RabbitMQModule],
    };
  }

  static forFeature() {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBusService', //rabbitmq-module
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMQMessaging(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBusService'],
    };
  }
}
