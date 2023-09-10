import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
import { CompleteProcessAudioVideoMediaUseCase } from '../../core/video/application/use-cases/complete-process-audio-video-media/complete-process-audio-video-media.use-case';
import {
  CompleteProcessAudioVideoMediaInput,
  ValidateCompleteProcessAudioVideoMediaInput,
} from '../../core/video/application/use-cases/complete-process-audio-video-media/complete-process-audio-video-media.input';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class VideosConsumer {
  constructor(private moduleRef: ModuleRef) {}

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
  })
  async onProcessVideo(msg: {
    video: {
      resource_id: string;
      encoded_video_folder: string;
      status: 'COMPLETED';
    };
  }) {
    try {
      const [video_id, field] = msg.video.resource_id.split('.');
      console.log(video_id, field);
      const input = new CompleteProcessAudioVideoMediaInput({
        video_id,
        encoded_location: msg.video.encoded_video_folder,
        field: field as any,
      });
      const errors =
        ValidateCompleteProcessAudioVideoMediaInput.validate(input);
      if (errors.length) {
        console.log(errors);
        return new Nack();
        //throw new Error('Validation failed!');
      }
      const completeProcessAudioVideoMediaUseCase =
        await this.moduleRef.resolve(CompleteProcessAudioVideoMediaUseCase);
      await completeProcessAudioVideoMediaUseCase.execute(input);
    } catch (err) {
      console.error(err);
      return new Nack();
    }
  }
}
