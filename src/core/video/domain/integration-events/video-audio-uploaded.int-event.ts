import { IIntegrationEvent } from '../../../shared/domain/events/integration-event.interface';
import { VideoMediaReplacedEvent } from '../domain-events/video-audio-media-replaced.event';

export class VideoAudioUploadedIntegrationEvents implements IIntegrationEvent {
  event_name: string;
  payload: any;
  event_version: number;
  occurred_on: Date;
  constructor(event: VideoMediaReplacedEvent) {
    // this.resource_id = `${event.aggregate_id.id}.${event.media_type}`;
    // this.file_path = event.media.destination();
    this.event_name = this.constructor.name;
    this.payload = {
      resource_id: `${event.aggregate_id.id}.${event.media_type}`,
      file_path: event.media.destination(),
    };
    this.event_version = 1;
    this.occurred_on = new Date();
  }
}
