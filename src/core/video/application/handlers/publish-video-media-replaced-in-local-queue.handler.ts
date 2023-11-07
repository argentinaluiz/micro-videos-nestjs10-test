import { OnEvent } from '@nestjs/event-emitter';
import { IDomainEventHandler } from '../../../shared/application/domain-event-handler.interface';
import { IIntegrationEventQueueService } from '../../../shared/application/queue.interface';
import { VideoMediaReplacedEvent } from '../../domain/domain-events/video-audio-media-replaced.event';
import { VideoAudioUploadedIntegrationEvents } from '../../domain/integration-events/video-audio-uploaded.int-event';

export class PublishVideoMediaReplacedInLocalQueueHandler
  implements IDomainEventHandler
{
  constructor(private intEventsQueue: IIntegrationEventQueueService) {}

  @OnEvent(VideoMediaReplacedEvent.name)
  async handle(event: VideoMediaReplacedEvent): Promise<void> {
    const integrationEvent = new VideoAudioUploadedIntegrationEvents(event);
    await this.intEventsQueue.add(integrationEvent);
  }
}
