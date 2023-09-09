import { CreateVideoUseCase } from '../create-video.use-case';
import { Video, VideoId } from '../../../../domain/video.aggregate';
import {
  CategoryModel,
  CategorySequelizeRepository,
} from '../../../../../category/infra/db/sequelize/category-sequelize';
import { UnitOfWorkSequelize } from '../../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { CategoriesIdsValidator } from '../../../../../category/application/validations/categories-ids.validator';
import { Category } from '../../../../../category/domain/category.aggregate';
import { VideoSequelizeRepository } from '../../../../infra/db/sequelize/video-sequelize.repository';
import { setupSequelizeForVideo } from '../../../../infra/db/sequelize/testing/setup-sequelize-for-video';
import { VideoModel } from '../../../../infra/db/sequelize/video.model';
import { GenresIdsValidator } from '../../../../../genre/application/validations/genres-ids.validator';
import { CastMembersIdsValidator } from '../../../../../cast-member/application/validations/cast-members-ids.validator';
import {
  GenreModel,
  GenreSequelizeRepository,
} from '../../../../../genre/infra/db/sequelize/genre-sequelize';
import {
  CastMemberModel,
  CastMemberSequelizeRepository,
} from '../../../../../cast-member/infra/db/sequelize/cast-member-sequelize';
import { Genre } from '../../../../../genre/domain/genre.aggregate';
import { CastMember } from '../../../../../cast-member/domain/cast-member.aggregate';
import { RatingValues } from '../../../../domain/rating.vo';
import { DatabaseError } from 'sequelize';
describe('CreateVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateVideoUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;

  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdsValidator: CategoriesIdsValidator;
  let genresIdsValidator: GenresIdsValidator;
  let castMembersIdsValidator: CastMembersIdsValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    categoriesIdsValidator = new CategoriesIdsValidator(categoryRepo);
    genresIdsValidator = new GenresIdsValidator(genreRepo);
    castMembersIdsValidator = new CastMembersIdsValidator(castMemberRepo);
    useCase = new CreateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  it('should create a video', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    await genreRepo.bulkInsert(genres);
    const genresId = genres.map((c) => c.genre_id.id);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.cast_member_id.id);

    const output = await useCase.execute({
      title: 'test video',
      description: 'test description',
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });
    expect(output).toStrictEqual({
      id: expect.any(String),
    });
    const video = await videoRepo.findById(new VideoId(output.id));
    expect(video.toJSON()).toStrictEqual({
      video_id: expect.any(String),
      title: 'test video',
      description: 'test description',
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      is_published: false,
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: expect.arrayContaining(categoriesId),
      genres_id: expect.arrayContaining(genresId),
      cast_members_id: expect.arrayContaining(castMembersId),
      created_at: expect.any(Date),
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    await genreRepo.bulkInsert(genres);
    const genresId = genres.map((c) => c.genre_id.id);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.cast_member_id.id);

    const video = Video.fake().aVideoWithoutMedias().build();
    video.title = 't'.repeat(256);

    const mockCreate = jest
      .spyOn(Video, 'create')
      .mockImplementation(() => video);

    await expect(
      useCase.execute({
        title: 'test video',
        rating: RatingValues.R10,
        categories_id: categoriesId,
        genres_id: genresId,
        cast_members_id: castMembersId,
      } as any),
    ).rejects.toThrowError(DatabaseError);

    const videos = await videoRepo.findAll();
    expect(videos.length).toEqual(0);

    mockCreate.mockRestore();
  });
});
