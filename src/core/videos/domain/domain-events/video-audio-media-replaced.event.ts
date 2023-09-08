import { IDomainEvent } from '../../../shared/domain/domain-event.interface';
import { AudioVideoMedia } from '../audio-video-media.vo';
import { VideoId } from '../video.aggregate';

export class VideoAudioMediaReplacedEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  constructor(
    readonly aggregate_id: VideoId,
    readonly media: AudioVideoMedia,
    readonly media_type: 'trailer' | 'video',
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}
