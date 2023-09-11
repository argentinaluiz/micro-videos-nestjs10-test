import { getModelToken } from '@nestjs/sequelize';
import { VideoInMemoryRepository } from '../../core/video/infra/db/in-memory/video-in-memory.repository';
import { CreateVideoUseCase } from '../../core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '../../core/video/application/use-cases/update-video/update-video.use-case';
//import { ListVideosUseCase } from '../../core/video/application/use-cases/list-videos/list-videos.use-case';
//import { GetVideoUseCase } from '../../core/video/application/use-cases/get-video/get-video.use-case';
//import { DeleteVideoUseCase } from '../../core/video/application/use-cases/delete-video/delete-video.use-case';
import { IVideoRepository } from '../../core/video/domain/video.repository';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { CategoriesIdsValidator } from '../../core/category/application/validations/categories-ids.validator';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { VideoSequelizeRepository } from '../../core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '../../core/video/infra/db/sequelize/video.model';
import { GenresIdsValidator } from '../../core/genre/application/validations/genres-ids.validator';
import { CastMembersIdsValidator } from '../../core/cast-member/application/validations/cast-members-ids.validator';
import { GENRES_PROVIDERS } from '../genres-module/genres.providers';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members-module/cast-members.providers';
import { GetVideoUseCase } from '../../core/video/application/use-cases/get-video/get-video.use-case';
import { IGenreRepository } from '../../core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { UploadAudioVideoMediasUseCase } from '../../core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { ApplicationService } from '../../core/shared/application/application.service';
import { IStorage } from '../../core/shared/application/storage.interface';
import { ProcessAudioVideoMediasUseCase } from '../../core/video/application/use-cases/process-audio-video-medias/process-video-media.use-case';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdsValidator,
      genresIdValidator: GenresIdsValidator,
      castMembersIdValidator: CastMembersIdsValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_VALIDATOR.provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_VALIDATOR.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdsValidator,
      genresIdValidator: GenresIdsValidator,
      castMembersIdValidator: CastMembersIdsValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_VALIDATOR.provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  // LIST_VIDEOS_USE_CASE: {
  //   provide: ListVideosUseCase,
  //   useFactory: (
  //     genreRepo: IVideoRepository,
  //     categoryRepo: ICategoryRepository,
  //   ) => {
  //     return new ListVideosUseCase(genreRepo, categoryRepo);
  //   },
  //   inject: [
  //     REPOSITORIES.VIDEO_REPOSITORY.provide,
  //     CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
  //   ],
  // },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  COMPLETE_PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
    ) => {
      return new ProcessAudioVideoMediasUseCase(appService, videoRepo);
    },
    inject: [ApplicationService, REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
  // DELETE_VIDEO_USE_CASE: {
  //   provide: DeleteVideoUseCase,
  //   useFactory: (uow: IUnitOfWork, genreRepo: IVideoRepository) => {
  //     return new DeleteVideoUseCase(uow, genreRepo);
  //   },
  //   inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  // },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
