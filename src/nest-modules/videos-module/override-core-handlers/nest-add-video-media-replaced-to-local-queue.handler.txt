import { OnEvent } from '@nestjs/event-emitter';
import { AddVideoMediaReplacedToLocalQueueHandler } from '../../../core/video/application/handlers/add-video-media-replaced-to-local-queue.handler';
import { VideoMediaReplacedEvent } from '../../../core/video/domain/domain-events/video-audio-media-replaced.event';

export class NestAddVideoMediaReplacedToLocalQueueHandler extends AddVideoMediaReplacedToLocalQueueHandler {
  @OnEvent(VideoMediaReplacedEvent.name)
  handle(event: VideoMediaReplacedEvent): Promise<void> {
    return super.handle(event);
  }
}
