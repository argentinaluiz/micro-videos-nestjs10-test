import { OnEvent } from '@nestjs/event-emitter';
import { PublishUploadVideoMediaHandler } from '../../../core/video/application/handlers/publish-upload-video-media.handler';
import { VideoAudioMediaReplacedEvent } from '../../../core/video/domain/domain-events/video-audio-media-replaced.event';

export class CorePublishUploadVideoMediaHandler extends PublishUploadVideoMediaHandler {
  @OnEvent(VideoAudioMediaReplacedEvent.name)
  handle(event: VideoAudioMediaReplacedEvent): Promise<void> {
    return super.handle(event);
  }
}
