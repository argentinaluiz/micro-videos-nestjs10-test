import { CastMemberId } from '../../../cast-member/domain/cast-member.aggregate';
import { CategoryId } from '../../../category/domain/category.aggregate';
import { GenreId } from '../../../genre/domain/genre.aggregate';
import { IDomainEvent } from '../../../shared/domain/events/domain-event.interface';
import { AudioVideoMedia } from '../audio-video-media.vo';
import { ImageMedia } from '../image-media.vo';
import { Rating } from '../rating.vo';
import { VideoId } from '../video.aggregate';

export type VideoCreatedEventProps = {
  video_id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;
  banner: ImageMedia | null;
  thumbnail: ImageMedia | null;
  thumbnail_half: ImageMedia | null;
  trailer: AudioVideoMedia | null;
  video: AudioVideoMedia | null;
  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
  created_at: Date;
};

export class VideoCreatedEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  readonly aggregate_id: VideoId;
  readonly title: string;
  readonly description: string;
  readonly year_launched: number;
  readonly duration: number;
  readonly rating: Rating;
  readonly is_opened: boolean;
  readonly is_published: boolean;
  readonly banner: ImageMedia | null;
  readonly thumbnail: ImageMedia | null;
  readonly thumbnail_half: ImageMedia | null;
  readonly trailer: AudioVideoMedia | null;
  readonly video: AudioVideoMedia | null;
  readonly categories_id: CategoryId[];
  readonly genres_id: GenreId[];
  readonly cast_members_id: CastMemberId[];
  readonly created_at: Date;

  constructor(props: VideoCreatedEventProps) {
    this.aggregate_id = props.video_id;
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;
    this.banner = props.banner;
    this.thumbnail = props.thumbnail;
    this.thumbnail_half = props.thumbnail_half;
    this.trailer = props.trailer;
    this.video = props.video;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
    this.created_at = props.created_at;
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}
