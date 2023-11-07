import EventEmitter2 from 'eventemitter2';
import { CastMember } from '../../../../../cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '../../../../../cast-member/domain/cast-member.repository';
import {
  CastMemberModel,
  CastMemberSequelizeRepository,
} from '../../../../../cast-member/infra/db/sequelize/cast-member-sequelize';
import { Category } from '../../../../../category/domain/category.aggregate';
import { ICategoryRepository } from '../../../../../category/domain/category.repository';
import {
  CategoryModel,
  CategorySequelizeRepository,
} from '../../../../../category/infra/db/sequelize/category-sequelize';
import { Genre } from '../../../../../genre/domain/genre.aggregate';
import { IGenreRepository } from '../../../../../genre/domain/genre.repository';
import {
  GenreModel,
  GenreSequelizeRepository,
} from '../../../../../genre/infra/db/sequelize/genre-sequelize';
import { ApplicationService } from '../../../../../shared/application/application.service';
import { IStorage } from '../../../../../shared/application/storage.interface';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { DomainEventManager } from '../../../../../shared/domain/events/domain-event-manager';
import { EntityValidationError } from '../../../../../shared/domain/validators/validation.error';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '../../../../../shared/infra/storage/in-memory.storage';
import { Video, VideoId } from '../../../../domain/video.aggregate';
import { IVideoRepository } from '../../../../domain/video.repository';
import { setupSequelizeForVideo } from '../../../../infra/db/sequelize/testing/setup-sequelize-for-video';
import { VideoSequelizeRepository } from '../../../../infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '../../../../infra/db/sequelize/video.model';
import { UploadAudioVideoMediasUseCase } from '../upload-audio-video-medias.use-case';
import { VideoMediaReplacedEvent } from '../../../../domain/domain-events/video-audio-media-replaced.event';
import { PublishVideoMediaReplacedInLocalQueueHandler } from '../../../handlers/publish-video-media-replaced-in-local-queue.handler';
import { IIntegrationEventQueueService } from '../../../../../shared/application/queue.interface';
import { InMemoryIntegrationEventQueue } from '../../../../../shared/infra/queue/in-memory-integration-event.queue';
import { VideoAudioUploadedIntegrationEvents } from '../../../../domain/integration-events/video-audio-uploaded.int-event';

describe('UploadAudioVideoMediasUseCase Unit Tests', () => {
  let uploadImageMediaUseCase: UploadAudioVideoMediasUseCase;
  let videoRepo: IVideoRepository;
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: IStorage;
  let applicationService: ApplicationService;
  let domainEventManager: DomainEventManager;
  let publishUploadVideoMediaHandler: PublishVideoMediaReplacedInLocalQueueHandler;
  let intEventsQueue: IIntegrationEventQueueService;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    intEventsQueue = new InMemoryIntegrationEventQueue();
    publishUploadVideoMediaHandler =
      new PublishVideoMediaReplacedInLocalQueueHandler(intEventsQueue);
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    domainEventManager = new DomainEventManager(new EventEmitter2());
    domainEventManager.registerForIntegrationEvent(
      VideoMediaReplacedEvent.name,
      (event: VideoMediaReplacedEvent) =>
        publishUploadVideoMediaHandler.handle(event),
    );
    applicationService = new ApplicationService(uow, domainEventManager);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new InMemoryStorage();

    uploadImageMediaUseCase = new UploadAudioVideoMediasUseCase(
      applicationService,
      videoRepo,
      storageService,
    );
  });

  it('should throw error when video not found', async () => {
    await expect(
      uploadImageMediaUseCase.execute({
        video_id: 'invalid_video_id',
        field: 'video',
        file: {
          raw_name: 'video.mp4',
          data: Buffer.from(''),
          mime_type: 'video/mp4',
          size: 100,
        },
      }),
    ).rejects.toThrowError(new NotFoundError('invalid_video_id', Video));
  });

  it('should throw error when video is invalid', async () => {
    expect.assertions(2);
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    try {
      await uploadImageMediaUseCase.execute({
        video_id: video.video_id.id,
        field: 'video',
        file: {
          raw_name: 'video.mp3',
          data: Buffer.from(''),
          mime_type: 'video/mp3',
          size: 100,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.error).toEqual([
        {
          video: ['Invalid media file mime type: video/mp3 not in video/mp4'],
        },
      ]);
    }
  });

  it('should upload banner image', async () => {
    const queueAddSpy = jest.spyOn(intEventsQueue, 'add');
    const storeSpy = jest.spyOn(storageService, 'store');
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);
    const castMember = CastMember.fake().anActor().build();
    await castMemberRepo.insert(castMember);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    await videoRepo.insert(video);

    const response = await uploadImageMediaUseCase.execute({
      video_id: video.video_id.id,
      field: 'video',
      file: {
        raw_name: 'video.mp4',
        data: Buffer.from('test data'),
        mime_type: 'video/mp4',
        size: 100,
      },
    });

    expect(response).toEqual({ id: video.video_id.id });
    const videoUpdated = await videoRepo.findById(new VideoId(response.id));
    expect(videoUpdated.video).toBeDefined();
    expect(videoUpdated.video.name.includes('.mp4')).toBeTruthy();
    expect(videoUpdated.video.raw_location).toBe(
      `videos/${videoUpdated.video_id.id}/videos`,
    );
    expect(storeSpy).toHaveBeenCalledWith({
      data: Buffer.from('test data'),
      id: videoUpdated.video.destination(),
      mime_type: 'video/mp4',
    });
    expect(queueAddSpy).toHaveBeenCalledWith({
      // resource_id: `${videoUpdated.video_id.id}.video`,
      // file_path: videoUpdated.video.destination(),
      event_name: VideoAudioUploadedIntegrationEvents.name,
      payload: {
        resource_id: `${videoUpdated.video_id.id}.video`,
        file_path: videoUpdated.video.destination(),
      },
      event_version: 1,
      occurred_on: expect.any(Date),
    });
  });
});
