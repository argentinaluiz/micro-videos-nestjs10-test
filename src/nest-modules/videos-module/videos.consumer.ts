import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ProcessAudioVideoMediasUseCase } from '../../core/video/application/use-cases/process-audio-video-medias/process-video-media.use-case';
import { ModuleRef } from '@nestjs/core';
import {
  ProcessAudioVideoMediasInput,
  ValidateProcessAudioVideoMediasInput,
} from '../../core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.input';
import { RabbitmqRetriableError } from '../rabbitmq-module/rabbitmq-retriable.error';

@Injectable()
export class VideosConsumer {
  constructor(private moduleRef: ModuleRef) {}

  @RabbitSubscribe({
    exchange: 'delay.exchange',
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
    queueOptions: {
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'videos.convert',
      //messageTtl: 5000,
    },
  })
  async onProcessVideo(msg: {
    video: {
      resource_id: string;
      encoded_video_folder: string;
      status: 'COMPLETED';
    };
  }) {
    console.log('aaaaaaa');
    console.log(msg);
    try {
      const [video_id, field] = msg.video.resource_id.split('.');
      console.log(video_id, field);
      const input = new ProcessAudioVideoMediasInput({
        video_id,
        encoded_location: msg.video.encoded_video_folder,
        field: field as any,
      });
      await new ValidationPipe().transform(input, {
        metatype: ProcessAudioVideoMediasInput,
        type: 'body',
      });
      // const errors = ValidateProcessAudioVideoMediasInput.validate(input);
      // if (errors.length) {
      //   console.log(errors);
      //   return new Nack();
      //   //throw new Error('Validation failed!');
      // }
      const completeProcessAudioVideoMediaUseCase =
        await this.moduleRef.resolve(ProcessAudioVideoMediasUseCase);
      await completeProcessAudioVideoMediaUseCase.execute(input);
    } catch (err) {
      console.error(err);
      throw new RabbitmqRetriableError(err);
    }
  }
}
