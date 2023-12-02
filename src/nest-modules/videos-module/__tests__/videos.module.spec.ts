import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../database-module/database.module';
import { VideosModule } from '../videos.module';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWorkSequelize } from '../../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { getConnectionToken } from '@nestjs/sequelize';
import { ApplicationService } from '../../../core/shared/application/application.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventManager } from '../../../core/shared/domain/events/domain-event-manager';
import { ConfigModule } from '../../config-module/config.module';
import { SharedModule } from '../../shared-module/shared.module';
import { QueueModule } from '../../queue-module/queue.module';
import { VideoMediaReplacedEvent } from '../../../core/video/domain/domain-events/video-audio-media-replaced.event';
import { EventModule } from '../../event-module/event.module';
import { AuthModule } from '../../auth-module/auth.module';
import { RabbitmqModule } from '../../rabbitmq-module/rabbitmq-module';

describe('VideosModule Unit Tests', () => {
  let module: TestingModule;
  beforeEach(async () => {
    console.warn = jest.fn();
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        QueueModule,
        SharedModule,
        EventModule.register({ enableQueueConsumers: false }),
        RabbitmqModule.forRoot(),
        DatabaseModule,
        AuthModule,
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .overrideProvider(ApplicationService)
      .useFactory({
        factory: (
          uow: UnitOfWorkSequelize,
          domainEventManager: DomainEventManager,
        ) => {
          return new ApplicationService(uow, domainEventManager);
        },
        inject: ['UnitOfWork', DomainEventManager],
      })
      .compile();
    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should register events', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);
    expect(eventemitter2.listeners(VideoMediaReplacedEvent.name)).toHaveLength(
      1,
    );
  });
});
