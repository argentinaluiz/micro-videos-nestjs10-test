import { CastMemberId } from '../../../cast-member/domain/cast-member.aggregate';
import { CategoryId } from '../../../category/domain/category.aggregate';
import { GenreId } from '../../../genre/domain/genre.aggregate';
import { AudioVideoMedia } from '../audio-video-media.vo';
import { ImageMedia } from '../image-media.vo';
import { Rating } from '../rating.vo';
import { Video, VideoId } from '../video.aggregate';

describe('Video Unit Tests', () => {
  beforeEach(() => {
    Video.prototype.validate = jest
      .fn()
      .mockImplementation(Video.prototype.validate);
  });
  test('constructor of video', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map<string, CategoryId>([
      [categoryId.id, categoryId],
    ]);
    const genreId = new GenreId();
    const genresId = new Map<string, GenreId>([[genreId.id, genreId]]);
    const castMemberId = new CastMemberId();
    const castMembersId = new Map<string, CastMemberId>([
      [castMemberId.id, castMemberId],
    ]);
    const rating = Rating.createRL();
    let video = new Video({
      title: 'test title',
      description: 'test description',
      year_launched: 2020,
      duration: 90,
      rating,
      opened: true,
      published: true,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });
    expect(video).toBeInstanceOf(Video);
    expect(video.video_id).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.opened).toBe(true);
    expect(video.published).toBe(true);
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnail_half).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categories_id).toEqual(categoriesId);
    expect(video.genres_id).toEqual(genresId);
    expect(video.cast_members_id).toEqual(castMembersId);
    expect(video.created_at).toBeInstanceOf(Date);

    const banner = new ImageMedia({
      checksum: 'test checksum banner',
      name: 'test name banner',
      location: 'test location banner',
    });

    const thumbnail = new ImageMedia({
      checksum: 'test checksum thumbnail',
      name: 'test name thumbnail',
      location: 'test location thumbnail',
    });

    const thumbnailHalf = new ImageMedia({
      checksum: 'test checksum thumbnail half',
      name: 'test name thumbnail half',
      location: 'test location thumbnail half',
    });

    const trailer = AudioVideoMedia.create({
      checksum: 'test checksum trailer',
      name: 'test name trailer',
      raw_location: 'test raw location trailer',
    });

    const videoMedia = AudioVideoMedia.create({
      checksum: 'test checksum video',
      name: 'test name video',
      raw_location: 'test raw location video',
    });

    video = new Video({
      title: 'test title',
      description: 'test description',
      year_launched: 2020,
      duration: 90,
      rating,
      opened: true,
      published: true,
      banner,
      thumbnail,
      thumbnail_half: thumbnailHalf,
      trailer,
      video: videoMedia,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });

    expect(video).toBeInstanceOf(Video);
    expect(video.video_id).toBeInstanceOf(VideoId);
    expect(video.title).toBe('test title');
    expect(video.description).toBe('test description');
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toBeInstanceOf(Rating);
    expect(video.opened).toBe(true);
    expect(video.published).toBe(true);
    expect(video.banner).toEqual(banner);
    expect(video.thumbnail).toEqual(thumbnail);
    expect(video.thumbnail_half).toEqual(thumbnailHalf);
    expect(video.trailer).toEqual(trailer);
    expect(video.video).toEqual(videoMedia);
    expect(video.categories_id).toEqual(categoriesId);
    expect(video.genres_id).toEqual(genresId);
    expect(video.cast_members_id).toEqual(castMembersId);
    expect(video.created_at).toBeInstanceOf(Date);
  });

  describe('video_id field', () => {
    const arrange = [
      {},
      { id: null },
      { id: undefined },
      { id: new VideoId() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const genre = new Video(item as any);
      expect(genre.video_id).toBeInstanceOf(VideoId);
    });
  });
  //TODO - testar o restante dos campos
  // describe('create command', () => {
  //   test('should create a genre', () => {
  //     const categoryId = new CategoryId();
  //     const categories_id = new Map<string, CategoryId>([
  //       [categoryId.id, categoryId],
  //     ]);
  //     const genre = Video.create({
  //       name: 'test',
  //       categories_id: [categoryId],
  //     });
  //     expect(genre.genre_id).toBeInstanceOf(VideoId);
  //     expect(genre.name).toBe('test');
  //     expect(genre.categories_id).toEqual(categories_id);
  //     expect(genre.created_at).toBeInstanceOf(Date);
  //     expect(Video.prototype.validate).toHaveBeenCalledTimes(1);

  //     const genre2 = Video.create({
  //       name: 'test',
  //       categories_id: [categoryId],
  //       is_active: false,
  //     });
  //     expect(genre2.genre_id).toBeInstanceOf(VideoId);
  //     expect(genre2.name).toBe('test');
  //     expect(genre2.categories_id).toEqual(categories_id);
  //     expect(genre2.is_active).toBe(false);
  //     expect(genre2.created_at).toBeInstanceOf(Date);
  //   });
  // });

  //TODO - testar o restante dos campos
  // test('should change name', () => {
  //   const genre = Video.create({
  //     name: 'test',
  //     categories_id: [new CategoryId()],
  //   });
  //   genre.changeName('test2');
  //   expect(genre.name).toBe('test2');
  //   expect(Video.prototype.validate).toHaveBeenCalledTimes(2);
  // });

  //TODO - testar o restante dos campos
  // test('should add category id', () => {
  //   const categoryId = new CategoryId();
  //   const genre = Video.create({
  //     name: 'test',
  //     categories_id: [categoryId],
  //   });
  //   genre.addCategoryId(categoryId);
  //   expect(genre.categories_id.size).toBe(1);
  //   expect(genre.categories_id).toEqual(new Map([[categoryId.id, categoryId]]));
  //   expect(Video.prototype.validate).toHaveBeenCalledTimes(1);

  //   const categoryId2 = new CategoryId();
  //   genre.addCategoryId(categoryId2);
  //   expect(genre.categories_id.size).toBe(2);
  //   expect(genre.categories_id).toEqual(
  //     new Map([
  //       [categoryId.id, categoryId],
  //       [categoryId2.id, categoryId2],
  //     ]),
  //   );
  //   expect(Video.prototype.validate).toHaveBeenCalledTimes(1);
  // });
});

describe('Video Validator', () => {
  describe('create command', () => {
    test('should an invalid video with title property', () => {
      const video = Video.create({
        title: 't'.repeat(256),
      } as any);
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
  describe('changeTitle method', () => {
    it('should a invalid video using title property', () => {
      const video = Video.fake().aVideo().build();
      video.changeName('t'.repeat(256));
      expect(video.notification.hasErrors()).toBe(true);
      expect(video.notification).notificationContainsErrorMessages([
        {
          title: ['title must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
