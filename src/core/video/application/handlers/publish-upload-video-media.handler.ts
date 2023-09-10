import { IDomainEventHandler } from '../../../shared/application/domain-event-handler.interface';
import { IIntegrationEventQueueService } from '../../../shared/application/queue-interface';
import { VideoAudioMediaReplacedEvent } from '../../domain/domain-events/video-audio-media-replaced.event';
import { VideoAudioUploadedIntegrationEvents } from '../../domain/integration-events/video-audio-uploaded.int-event';

export class PublishUploadVideoMediaHandler implements IDomainEventHandler {
  constructor(private integrationEventsQueue: IIntegrationEventQueueService) {}

  async handle(event: VideoAudioMediaReplacedEvent): Promise<void> {
    const integrationEvent = new VideoAudioUploadedIntegrationEvents(event);
    await this.integrationEventsQueue.add(integrationEvent);
  }
}
