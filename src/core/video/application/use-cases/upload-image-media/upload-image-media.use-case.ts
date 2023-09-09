import { IStorage } from '../../../../shared/application/storage.interface';
import { IUseCase } from '../../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { AggregateValidationError } from '../../../../shared/domain/validators/validation.error';
import { Banner } from '../../../domain/banner.vo';
import { ThumbnailHalf } from '../../../domain/thumbnail-half.vo';
import { Thumbnail } from '../../../domain/thumbnail.vo';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';
import { UploadImageMediaInput } from './upload-image-media.input';

export class UploadImageMediaUseCase
  implements IUseCase<UploadImageMediaInput, UpdateImageMediaOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(input: UploadImageMediaInput): Promise<UpdateImageMediaOutput> {
    const video = await this.videoRepo.findById(new VideoId(input.video_id));
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnail_half: ThumbnailHalf,
    };

    const imageClass = imagesMap[input.field] as
      | typeof Banner
      | typeof Thumbnail
      | typeof ThumbnailHalf;
    const [image, errorImage] = imageClass
      .createFromFile({
        ...input.file,
        video_id: video.video_id,
      })
      .asArray();

    if (errorImage) {
      throw new AggregateValidationError([
        {
          [input.field]: [errorImage.message],
        },
      ]);
    }

    await this.storage.store({
      data: input.file.data,
      id: image.destination(),
      mime_type: input.file.mime_type,
    });

    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    await this.uow.do(async () => {
      return this.videoRepo.update(video);
    });

    return { id: video.video_id.id };
  }
}

export type UpdateImageMediaOutput = { id: string };
