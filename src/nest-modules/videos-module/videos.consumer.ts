import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ProcessAudioVideoMediasUseCase } from '../../core/video/application/use-cases/process-audio-video-medias/process-video-media.use-case';
import { ModuleRef } from '@nestjs/core';
import {
  ProcessAudioVideoMediasInput,
  ValidateProcessAudioVideoMediasInput,
} from '../../core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.input';

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
      const input = new ProcessAudioVideoMediasInput({
        video_id,
        encoded_location: msg.video.encoded_video_folder,
        field: field as any,
      });
      const errors = ValidateProcessAudioVideoMediasInput.validate(input);
      if (errors.length) {
        console.log(errors);
        return new Nack();
        //throw new Error('Validation failed!');
      }
      const completeProcessAudioVideoMediaUseCase =
        await this.moduleRef.resolve(ProcessAudioVideoMediasUseCase);
      await completeProcessAudioVideoMediaUseCase.execute(input);
    } catch (err) {
      console.error(err);
      return new Nack();
    }
  }
}
