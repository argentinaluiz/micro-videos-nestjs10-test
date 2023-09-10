import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/db/sequelize/genre-sequelize';
import { CategoriesModule } from '../categories-module/categories.module';
import { VIDEOS_PROVIDERS } from './videos.providers';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../../core/video/infra/db/sequelize/video.model';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category-sequelize';
import { ImageMediaModel } from '../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../core/video/infra/db/sequelize/audio-video-media.model';
import { GenresModule } from '../genres-module/genres.module';
import { CastMembersModule } from '../cast-members-module/cast-members.module';
import { CorePublishUploadVideoMediaHandler } from './core-handlers/core-publish-upload-video-media.handler';
import { IIntegrationEventQueueService } from '../../core/shared/application/queue-interface';
import { VideosConsumer } from './videos.consumer';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
      CategoryModel,
      GenreModel,
      GenreCategoryModel,
    ]),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    {
      provide: CorePublishUploadVideoMediaHandler,
      useFactory: (queueService: IIntegrationEventQueueService) => {
        return new CorePublishUploadVideoMediaHandler(queueService);
      },
      inject: ['IIntegrationEventQueueService'],
    },
    VideosConsumer,
  ],
  exports: [VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide],
})
export class VideosModule {}
