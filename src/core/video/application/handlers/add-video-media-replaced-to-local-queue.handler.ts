import { IDomainEventHandler } from '../../../shared/application/domain-event-handler.interface';
import { IIntegrationEventQueueService } from '../../../shared/application/queue.interface';
import { VideoMediaReplacedEvent } from '../../domain/domain-events/video-audio-media-replaced.event';
import { VideoAudioUploadedIntegrationEvents } from '../../domain/integration-events/video-audio-uploaded.int-event';

export class AddVideoMediaReplacedToLocalQueueHandler
  implements IDomainEventHandler
{
  constructor(private intEventsQueue: IIntegrationEventQueueService) {}

  async handle(event: VideoMediaReplacedEvent): Promise<void> {
    const integrationEvent = new VideoAudioUploadedIntegrationEvents(event);
    await this.intEventsQueue.add(integrationEvent);
  }
}
