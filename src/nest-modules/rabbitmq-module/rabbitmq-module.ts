import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQMessaging } from '../../core/shared/infra/messaging/rabbitmq.messaging';

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
            connectionInitOptions: { wait: false },
            registerHandlers: configService.get('RABBITMQ_REGISTER_HANDLERS'),
          }),
          inject: [ConfigService],
        }),
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
