import { Chance } from 'chance';
import { Video, VideoId } from './video.aggregate';
import { CategoryId } from '../../category/domain/category.aggregate';
import { Rating } from './rating.vo';
import { ImageMedia } from './image-media.vo';
import { AudioVideoMedia } from './audio-video-media.vo';
import { GenreId } from '../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _video_id: PropOrFactory<VideoId> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _title: PropOrFactory<string> = (_index) => this.chance.word();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _description: PropOrFactory<string> = (_index) => this.chance.word();
  private _year_launched: PropOrFactory<number> = (_index) =>
    this.chance.year();
  private _duration: PropOrFactory<number> = (_index) =>
    this.chance.integer({ min: 1, max: 100 });
  private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
  private _opened: PropOrFactory<boolean> = (_index) => true;
  private _published: PropOrFactory<boolean> = (_index) => true;
  private _banner: PropOrFactory<ImageMedia | null> | undefined =
    new ImageMedia({
      checksum: 'test checksum banner',
      name: 'test name banner',
      location: 'test path banner',
    });
  private _thumbnail: PropOrFactory<ImageMedia | null> | undefined =
    new ImageMedia({
      checksum: 'test checksum thumbnail',
      name: 'test name thumbnail',
      location: 'test path thumbnail',
    });
  private _thumbnail_half: PropOrFactory<ImageMedia | null> | undefined =
    new ImageMedia({
      checksum: 'test checksum thumbnail half',
      name: 'test name thumbnail half',
      location: 'test path thumbnail half',
    });
  private _trailer: PropOrFactory<ImageMedia | null> | undefined =
    AudioVideoMedia.create({
      checksum: 'test checksum trailer',
      name: 'test name trailer',
      raw_location: 'test path trailer',
    });
  private _video: PropOrFactory<ImageMedia | null> | undefined =
    AudioVideoMedia.create({
      checksum: 'test checksum video',
      name: 'test name video',
      raw_location: 'test path video',
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _categories_id: PropOrFactory<CategoryId>[] = [];
  private _genres_id: PropOrFactory<GenreId>[] = [];
  private _cast_members_id: PropOrFactory<CastMemberId>[] = [];

  // auto generated in entity
  private _created_at: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aVideoWithAllMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static aVideoWithoutMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static theVideos(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
    this._video_id = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string>) {
    this._description = valueOrFactory;
    return this;
  }

  withYearLaunched(valueOrFactory: PropOrFactory<number>) {
    this._year_launched = valueOrFactory;
    return this;
  }

  withDuration(valueOrFactory: PropOrFactory<number>) {
    this._duration = valueOrFactory;
    return this;
  }

  withRating(valueOrFactory: PropOrFactory<Rating>) {
    this._rating = valueOrFactory;
    return this;
  }

  withMarkAsOpened() {
    this._opened = true;
    return this;
  }

  withMarkAsNotOpened() {
    this._opened = false;
    return this;
  }

  withMarkAsPublished() {
    this._published = true;
    return this;
  }

  withBanner(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._banner = valueOrFactory;
    return this;
  }

  withThumbnail(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnail = valueOrFactory;
    return this;
  }

  withThumbnailHalf(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnail_half = valueOrFactory;
    return this;
  }

  withTrailer(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._trailer = valueOrFactory;
    return this;
  }

  withVideo(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._video = valueOrFactory;
    return this;
  }

  withCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categories_id.push(valueOrFactory);
    return this;
  }

  activate() {
    this._is_active = true;
    return this;
  }

  deactivate() {
    this._is_active = false;
    return this;
  }

  withInvalidNameEmpty(value: '' | null | undefined) {
    this._title = value as any;
    return this;
  }

  withInvalidNameNotAString(value?: any) {
    this._title = value ?? 5;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._title = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withInvalidCategoryId() {
    this._categories_id.push('fake id' as any);
    return this;
  }

  withInvalidIsActiveEmpty(value: '' | null | undefined) {
    this._is_active = value as any;
    return this;
  }

  withInvalidIsActiveNotABoolean(value?: any) {
    this._is_active = value ?? 'fake boolean';
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._created_at = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const Videos = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();
      const categoriesId = this._categories_id.length
        ? this.callFactory(this._categories_id, index)
        : [categoryId];

      const genre = new Video({
        genre_id: !this._video_id
          ? undefined
          : this.callFactory(this._video_id, index),
        name: this.callFactory(this._title, index),
        categories_id: new Map(categoriesId.map((id) => [id.id, id])),
        is_active: this.callFactory(this._is_active, index),
        ...(this._created_at && {
          created_at: this.callFactory(this._created_at, index),
        }),
        ...(this._created_at && {
          created_at: this.callFactory(this._created_at, index),
        }),
      });
      genre.validate();
      return genre;
    });
    return this.countObjs === 1 ? (Videos[0] as any) : Videos;
  }

  get genre_id() {
    return this.getValue('genre_id');
  }

  get name() {
    return this.getValue('name');
  }

  get categories_id(): CategoryId[] {
    let categories_id = this.getValue('categories_id');

    if (!categories_id.length) {
      categories_id = [new CategoryId()];
    }
    return categories_id;
  }

  get is_active() {
    return this.getValue('is_active');
  }

  get created_at() {
    return this.getValue('created_at');
  }

  private getValue(prop: any) {
    const optional = ['genre_id', 'created_at'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }
    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
