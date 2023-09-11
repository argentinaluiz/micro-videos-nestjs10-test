import { ApplicationService } from '../../../../shared/application/application.service';
import { IUseCase } from '../../../../shared/application/use-case-interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';
import { ProcessAudioVideoMediasInput } from './process-audio-video-medias.input';

export class ProcessAudioVideoMediasUseCase
  implements
    IUseCase<ProcessAudioVideoMediasInput, ProcessAudioVideoMediasOutput>
{
  constructor(
    private application: ApplicationService,
    private videoRepo: IVideoRepository,
  ) {}

  async execute(
    input: ProcessAudioVideoMediasInput,
  ): Promise<ProcessAudioVideoMediasOutput> {
    const video = await this.videoRepo.findById(new VideoId(input.video_id));
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    if (input.field === 'trailer') {
      video.trailer = video.trailer.complete(input.encoded_location);
    }

    if (input.field === 'video') {
      video.video = video.video.complete(input.encoded_location);
    }

    await this.application.run(async () => {
      return this.videoRepo.update(video);
    });

    return { id: video.video_id.id };
  }
}

export type ProcessAudioVideoMediasOutput = { id: string };
