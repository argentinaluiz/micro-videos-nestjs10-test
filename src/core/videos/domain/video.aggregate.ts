import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
// import { VideoFakeBuilder } from './video-fake.builder';
import { CategoryId } from '../../category/domain/category.aggregate';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { GenreId } from '../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';
import { Rating } from './rating.vo';
import { ImageMedia } from './image-media.vo';
import { AudioVideoMedia } from './audio-video-media.vo';
import VideoValidatorFactory from './video.validator';

export type VideoConstructorProps = {
  video_id?: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  opened: boolean;
  published: boolean;

  banner?: ImageMedia;
  thumbnail?: ImageMedia;
  thumbnail_half?: ImageMedia;
  trailer?: AudioVideoMedia;
  video?: AudioVideoMedia;

  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  opened: boolean;

  banner?: ImageMedia;
  thumbnail?: ImageMedia;
  thumbnail_half?: ImageMedia;
  trailer?: AudioVideoMedia;
  video?: AudioVideoMedia;

  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
  video_id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  opened: boolean;
  published: boolean;
  banner: ImageMedia | null;
  thumbnail?: ImageMedia | null;
  thumbnail_half?: ImageMedia | null;
  trailer?: AudioVideoMedia | null;
  video?: AudioVideoMedia | null;
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at: Date;

  constructor(props: VideoConstructorProps) {
    super();
    this.video_id = props.video_id ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.opened = props.opened;
    this.published = props.published;
    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnail_half = props.thumbnail_half ?? null;
    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: VideoCreateCommand) {
    const video = new Video({
      ...props,
      categories_id: !props.categories_id
        ? null
        : new Map(props.categories_id.map((id) => [id.id, id])),
      genres_id: !props.genres_id
        ? null
        : new Map(props.genres_id.map((id) => [id.id, id])),
      cast_members_id: !props.cast_members_id
        ? null
        : new Map(props.cast_members_id.map((id) => [id.id, id])),
      published: false,
    });
    video.validate(['title']);
    return video;
  }

  changeTitle(title: string): void {
    this.title = title;
    this.validate(['title']);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  changeYearLaunched(yearLaunched: number): void {
    this.year_launched = yearLaunched;
  }

  changeDuration(duration: number): void {
    this.duration = duration;
  }

  changeRating(rating: Rating): void {
    this.rating = rating;
  }

  markAsOpened(): void {
    this.opened = true;
  }

  markAsNotOpened(): void {
    this.opened = false;
  }

  replaceBanner(banner: ImageMedia): void {
    this.banner = banner;
  }

  replaceThumbnail(thumbnail: ImageMedia): void {
    this.thumbnail = thumbnail;
  }

  replaceThumbnailHalf(thumbnailHalf: ImageMedia): void {
    this.thumbnail_half = thumbnailHalf;
  }

  replaceTrailer(trailer: AudioVideoMedia): void {
    this.trailer = trailer;
  }

  replaceVideo(video: AudioVideoMedia): void {
    this.video = video;
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categories_id.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categories_id.delete(categoryId.id);
  }

  syncCategoriesId(categoriesId: CategoryId[]): void {
    if (!this.categories_id) {
      return;
    }
    this.categories_id = !categoriesId
      ? null
      : new Map(categoriesId.map((id) => [id.id, id]));
  }

  addGenreId(genreId: GenreId): void {
    this.genres_id.set(genreId.id, genreId);
  }

  removeGenreId(genreId: GenreId): void {
    this.genres_id.delete(genreId.id);
  }

  syncGenresId(genresId: GenreId[]): void {
    if (!this.genres_id) {
      return;
    }
    this.genres_id = !genresId
      ? null
      : new Map(genresId.map((id) => [id.id, id]));
  }

  addCastMemberId(castMemberId: CastMemberId): void {
    this.cast_members_id.set(castMemberId.id, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId): void {
    this.cast_members_id.delete(castMemberId.id);
  }

  syncCastMembersId(castMembersId: CastMemberId[]): void {
    if (!this.cast_members_id) {
      return;
    }
    this.cast_members_id = !castMembersId
      ? null
      : new Map(castMembersId.map((id) => [id.id, id]));
  }

  validate(fields?: string[]) {
    const validator = VideoValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return VideoFakeBuilder;
  }

  get entity_id() {
    return this.video_id;
  }

  toJSON() {
    return {
      video_id: this.video_id.id,
      title: this.title,
      description: this.description,
      year_launched: this.year_launched,
      duration: this.duration,
      rating: this.rating.value,
      opened: this.opened,
      published: this.published,
      banner: this.banner?.toJSON(),
      thumbnail: this.thumbnail?.toJSON(),
      thumbnail_half: this.thumbnail_half?.toJSON(),
      trailer: this.trailer?.toJSON(),
      video: this.video?.toJSON(),
      categories_id: Array.from(this.categories_id.values()).map((id) => id.id),
      genres_id: Array.from(this.genres_id.values()).map((id) => id.id),
      cast_members_id: Array.from(this.cast_members_id.values()).map(
        (id) => id.id,
      ),
      created_at: this.created_at,
    };
  }
}
