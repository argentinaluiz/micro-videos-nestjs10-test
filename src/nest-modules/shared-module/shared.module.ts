import { Global, Module, Scope } from '@nestjs/common';
import { ApplicationService } from '../../core/shared/application/application.service';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import EventEmitter2 from 'eventemitter2';
import { DomainEventManager } from '../../core/shared/domain/events/domain-event-manager';
import { GoogleCloudStorage } from '../../core/shared/infra/storage/google-cloud.storage';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { BullIntegrationEventQueue } from '../../core/shared/infra/queue/bull-integration-event.queue';
import { Queue } from 'bull';
import { PublishIntegrationEventJob } from '../event-module/override-core-handlers/publish-integration-events.job';
import { IMessageBusService } from '../../core/shared/application/message-bus.interface';
import { RabbitmqModule } from '../rabbitmq-module/rabbitmq-module';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'IStorage',
      useFactory(configService: ConfigService) {
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new Storage({
          credentials: credentials,
        });
        return new GoogleCloudStorage(storage, bucket);
      },
      inject: [ConfigService],
    },
    {
      provide: DomainEventManager,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new DomainEventManager(eventEmitter);
      },
      inject: [EventEmitter2],
    },
    {
      provide: ApplicationService,
      useFactory: (
        uow: IUnitOfWork,
        domainEventManager: DomainEventManager,
      ) => {
        return new ApplicationService(uow, domainEventManager);
      },
      inject: ['UnitOfWork', DomainEventManager],
      scope: Scope.REQUEST,
    },
  ],
  exports: [ApplicationService, DomainEventManager, 'IStorage'],
})
export class SharedModule {}
