import { IDomainEvent } from '../../../shared/domain/events/domain-event.interface';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';

export class VideoMediaReplacedEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  constructor(
    readonly aggregate_id: VideoId,
    readonly media: Trailer | VideoMedia,
    readonly media_type: 'trailer' | 'video',
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}
