import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from './nest-modules/queue-module/queue.module';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq-module';
import { EventModule } from './nest-modules/event-module/event.module';
import { AuthModule } from './nest-modules/auth-module/auth.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    QueueModule,
    ConfigModule.forRoot(),
    RabbitmqModule.forRoot(),
    EventModule.registerAsyncWithConfig(),
    SharedModule,
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
