import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
  BelongsToMany,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { literal, Op } from 'sequelize';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { LoadAggregateError } from '../../../../shared/domain/validators/validation.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from '../../../domain/video.repository';
import { CategoryModel } from '../../../../category/infra/db/sequelize/category-sequelize';
import { CategoryId } from '../../../../category/domain/category.aggregate';
import { UnitOfWorkSequelize } from '../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
import { Notification } from '../../../../shared/domain/validators/notification';
import { GenreModel } from '../../../../genre/infra/db/sequelize/genre-sequelize';
import { CastMemberModel } from '../../../../cast-member/infra/db/sequelize/cast-member-sequelize';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { GenreId } from '../../../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../../../cast-member/domain/cast-member.aggregate';
import { ImageMedia } from '../../../domain/image-media.vo';
import {
  AudioVideoMedia,
  AudioVideoMediaStatus,
} from '../../../domain/audio-video-media.vo';
import { Rating, RatingValues } from '../../../domain/rating.vo';

export type VideoModelProps = {
  video_id: string;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: RatingValues;
  opened: boolean;
  published: boolean;
  image_medias: ImageMediaModel[];
  audio_video_medias: AudioVideoMediaModel[];
  categories_id: VideoCategoryModel[];
  categories: CategoryModel[];
  genres_id: VideoGenreModel[];
  genres: CategoryModel[];
  cast_members_id: VideoCastMemberModel[];
  cast_members: CastMemberModel[];
  created_at: Date;
};

@Table({ tableName: 'videos', timestamps: false })
export class VideoModel extends Model<VideoModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare year_launched: number;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare duration: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      RatingValues.RL,
      RatingValues.R10,
      RatingValues.R12,
      RatingValues.R14,
      RatingValues.R16,
      RatingValues.R18,
    ),
  })
  declare rating: RatingValues;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare opened: boolean;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare published: boolean;

  @HasMany(() => ImageMediaModel, 'video_id')
  declare image_medias: ImageMediaModel[];

  @HasMany(() => AudioVideoMediaModel, 'video_id')
  declare audio_video_medias: AudioVideoMediaModel[];

  @HasMany(() => VideoCategoryModel, 'video_id')
  declare categories_id: VideoCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
  declare categories: CategoryModel[];

  @HasMany(() => VideoGenreModel, 'video_id')
  declare genres_id: VideoGenreModel[];

  @BelongsToMany(() => GenreModel, () => VideoGenreModel)
  declare genres: GenreModel[];

  @HasMany(() => VideoCastMemberModel, 'video_id')
  declare cast_members_id: VideoCastMemberModel[];

  @BelongsToMany(() => CastMemberModel, () => VideoCastMemberModel)
  declare cast_members: CastMemberModel[];

  @Column({ allowNull: false, type: DataType.DATE(6) })
  declare created_at: Date;
}

export type VideoCategoryModelProps = {
  video_id: string;
  category_id: string;
};

@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID })
  declare category_id: string;
}

export type VideoGenreModelProps = {
  video_id: string;
  genre_id: string;
};

@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID })
  declare genre_id: string;
}

export type VideoCastMemberModelProps = {
  video_id: string;
  cast_member_id: string;
};

@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => CastMemberModel)
  @Column({ type: DataType.UUID })
  declare cast_member_id: string;
}

export class ImageMediaModelProps {
  image_media_id: string;
  checksum: string;
  name: string;
  location: string;
  video_id: string;
  video_related_field: 'banner' | 'thumbnail' | 'thumbnail_half';
}

@Table({
  tableName: 'image_medias',
  timestamps: false,
  indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export class ImageMediaModel extends Model<ImageMediaModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => new Uuid().id })
  declare image_media_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare checksum: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare location: string;

  @BelongsTo(() => VideoModel, 'video_id')
  declare video_id: string;

  @Column({ allowNull: false, type: DataType.STRING(20) })
  declare video_related_field: 'banner' | 'thumbnail' | 'thumbnail_half';
}

export class AudioVideoMediaModelProps {
  audio_video_media_id: string;
  checksum: string;
  name: string;
  raw_location: string;
  encoded_location: string | null;
  status: AudioVideoMediaStatus;
  video_id: string;
  video_related_field: 'trailer' | 'video';
}

@Table({
  tableName: 'audio_video_medias',
  timestamps: false,
  indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export class AudioVideoMediaModel extends Model<AudioVideoMediaModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => new Uuid().id })
  declare audio_video_media_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare checksum: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare raw_location: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  declare encoded_location: string | null;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      AudioVideoMediaStatus.PENDING,
      AudioVideoMediaStatus.PROCESSING,
      AudioVideoMediaStatus.COMPLETED,
      AudioVideoMediaStatus.FAILED,
    ),
  })
  declare status: AudioVideoMediaStatus;

  @BelongsTo(() => VideoModel, 'video_id')
  video_id: string;

  @Column({ allowNull: false, type: DataType.STRING(20) })
  declare video_related_field: 'trailer' | 'video';
}

export class VideoSequelizeRepository implements IVideoRepository {
  private videoModel: typeof VideoModel;
  private imageMediaModel: typeof ImageMediaModel;
  private audioVideoMediaModel: typeof AudioVideoMediaModel;
  private videoCategoryModel: typeof VideoCategoryModel;
  private videoGenreModel: typeof VideoGenreModel;
  private videoCastMemberModel: typeof VideoCastMemberModel;
  private uow: UnitOfWorkSequelize;

  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) =>
        `binary ${this.videoModel.name}.name ${sort_dir}`,
    },
  };
  relations_include = [
    'categories_id',
    'genres_id',
    'cast_members',
    'image_medias',
    'audio_video_medias',
  ];

  constructor(props: {
    videoModel: typeof VideoModel;
    videoCategoryModel: typeof VideoCategoryModel;
    videoGenreModel: typeof VideoGenreModel;
    videoCastMemberModel: typeof VideoCastMemberModel;
    uow: UnitOfWorkSequelize;
  }) {
    this.videoModel = props.videoModel;
    this.videoCategoryModel = props.videoCategoryModel;
    this.videoGenreModel = props.videoGenreModel;
    this.videoCastMemberModel = props.videoCastMemberModel;
    this.uow = props.uow;
  }

  async insert(aggregate: Video): Promise<void> {
    await this.videoModel.create(VideoModelMapper.toModelProps(aggregate), {
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(aggregates: Video[]): Promise<void> {
    const models = aggregates.map((e) => VideoModelMapper.toModelProps(e));
    await this.videoModel.bulkCreate(models, {
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(id: VideoId): Promise<Video> {
    const model = await this._get(id.id);
    return model ? VideoModelMapper.toAggregate(model) : null;
  }

  async findAll(): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toAggregate(m));
  }

  async findByIds(ids: VideoId[]): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      where: {
        video_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toAggregate(m));
  }

  async existsById(
    ids: VideoId[],
  ): Promise<{ exists: VideoId[]; not_exists: VideoId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsVideoModels = await this.videoModel.findAll({
      attributes: ['genre_id'],
      where: {
        video_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsVideoIds = existsVideoModels.map(
      (m) => new VideoId(m.video_id),
    );
    const notExistsVideoIds = ids.filter(
      (id) => !existsVideoIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsVideoIds,
      not_exists: notExistsVideoIds,
    };
  }

  async update(aggregate: Video): Promise<void> {
    const model = await this._get(aggregate.video_id.id);

    if (!model) {
      throw new NotFoundError(aggregate.video_id.id, this.getAggregate());
    }

    await Promise.all([
      await this.videoCategoryModel.destroy({
        where: { video_id: aggregate.video_id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.videoGenreModel.destroy({
        where: { video_id: aggregate.video_id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.videoCastMemberModel.destroy({
        where: { video_id: aggregate.video_id.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);

    const {
      categories_id,
      genres_id,
      cast_members_id,
      image_medias,
      audio_video_medias,
      ...props
    } = VideoModelMapper.toModelProps(aggregate);
    await this.videoModel.update(props, {
      where: { video_id: aggregate.video_id.id },
      transaction: this.uow.getTransaction(),
    });

    Promise.all([
      await model.$add('image_medias', image_medias),
      await model.$add('audio_video_medias', audio_video_medias),
      await model.$add(
        'categories',
        categories_id.map((c) => c.category_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      await model.$add(
        'genres',
        genres_id.map((c) => c.genre_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      await model.$add(
        'cast_members',
        cast_members_id.map((c) => c.cast_member_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);
  }
  async delete(id: VideoId): Promise<void> {
    const model = await this._get(id.id);
    if (!model) {
      throw new NotFoundError(id.id, this.getAggregate());
    }

    await Promise.all([
      await this.imageMediaModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.audioVideoMediaModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.videoCategoryModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.videoGenreModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      await this.videoCastMemberModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);
    await this.videoModel.destroy({
      where: { video_id: id.id },
      transaction: this.uow.getTransaction(),
    });
  }

  private async _get(id: string): Promise<VideoModel> {
    return this.videoModel.findByPk(id, {
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    });
  }

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const videoTableName = this.videoModel.getTableName();
    const videoCategoryTableName = this.videoCategoryModel.getTableName();
    const videoGenreTableName = this.videoGenreModel.getTableName();
    const videoCastMemberTableName = this.videoCastMemberModel.getTableName();
    const videoAlias = this.videoModel.name;

    const wheres = [];

    if (
      props.filter &&
      (props.filter.title ||
        props.filter.categories_id ||
        props.filter.genres_id ||
        props.filter.cast_members_id)
    ) {
      if (props.filter.title) {
        wheres.push({
          field: 'title',
          value: `%${props.filter.title}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${videoAlias}.title LIKE :title`,
        });
      }

      if (props.filter.categories_id) {
        wheres.push({
          field: 'categories_id',
          value: props.filter.categories_id.map((c) => c.id),
          get condition() {
            return {
              ['$categories_id.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCategoryTableName}.category_id IN (:categories_id)`,
        });
      }

      if (props.filter.genres_id) {
        wheres.push({
          field: 'genres_id',
          value: props.filter.genres_id.map((c) => c.id),
          get condition() {
            return {
              ['$genres_id.genre_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoGenreTableName}.genre_id IN (:genres_id)`,
        });
      }

      if (props.filter.cast_members_id) {
        wheres.push({
          field: 'cast_members_id',
          value: props.filter.cast_members_id.map((c) => c.id),
          get condition() {
            return {
              ['$cast_members_id.cast_member_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCastMemberTableName}.cast_member_id IN (:cast_members_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sort_dir)
        : `${videoAlias}.\`created_at\` DESC`;

    const count = await this.videoModel.count({
      distinct: true,
      include: [
        props.filter?.categories_id && 'categories_id',
        props.filter?.genres_id && 'genres_id',
        props.filter?.cast_members_id && 'cast_members_id',
      ].filter((i) => i),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${videoAlias}.\`video_id\`,${columnOrder} FROM ${videoTableName} as ${videoAlias}`,
      props.filter.categories_id
        ? `INNER JOIN ${videoCategoryTableName} ON ${videoAlias}.\`video_id\` = ${videoCategoryTableName}.\`category_id\``
        : '',
      props.filter.genres_id
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`genre_id\``
        : '',
      props.filter.cast_members_id
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`cast_member_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.videoModel.sequelize.query(query.join(' '), {
      replacements: wheres.reduce(
        (acc, w) => ({ ...acc, [w.field]: w.value }),
        {},
      ),
      transaction: this.uow.getTransaction(),
    });

    const models = await this.videoModel.findAll({
      where: {
        video_id: {
          [Op.in]: idsResult.map(
            (id: { genre_id: string }) => id.genre_id,
          ) as string[],
        },
      },
      include: this.relations_include,
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new VideoSearchResult({
      items: models.map((m) => VideoModelMapper.toAggregate(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.videoModel.sequelize.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return `${this.videoModel.name}.\`${sort}\` ${sort_dir}`;
  }

  getAggregate(): new (...args: any[]) => Video {
    return Video;
  }
}

export class VideoModelMapper {
  static toAggregate(model: VideoModel) {
    const {
      video_id: id,
      categories_id = [],
      genres_id = [],
      cast_members_id = [],
      image_medias = [],
      audio_video_medias = [],
      ...otherData
    } = model.toJSON();

    const categoriesId = categories_id.map(
      (c) => new CategoryId(c.category_id),
    );
    const genresId = genres_id.map((c) => new GenreId(c.genre_id));
    const castMembersId = cast_members_id.map(
      (c) => new CastMemberId(c.cast_member_id),
    );

    const notification = new Notification();
    if (!categoriesId.length) {
      notification.addError(
        'categories_id should not be empty',
        'categories_id',
      );
    }
    if (!genresId.length) {
      notification.addError('genres_id should not be empty', 'genres_id');
    }

    if (!castMembersId.length) {
      notification.addError(
        'cast_members_id should not be empty',
        'cast_members_id',
      );
    }

    const bannerModel = image_medias.find(
      (i) => i.video_related_field === 'banner',
    );
    const banner = bannerModel
      ? new ImageMedia({
          checksum: bannerModel.checksum,
          name: bannerModel.name,
          location: bannerModel.location,
        })
      : null;

    const thumbnailModel = image_medias.find(
      (i) => i.video_related_field === 'thumbnail',
    );
    const thumbnail = thumbnailModel
      ? new ImageMedia({
          checksum: thumbnailModel.checksum,
          name: thumbnailModel.name,
          location: thumbnailModel.location,
        })
      : null;

    const thumbnailHalfModel = image_medias.find(
      (i) => i.video_related_field === 'thumbnail_half',
    );

    const thumbnailHalf = thumbnailHalfModel
      ? new ImageMedia({
          checksum: thumbnailHalfModel.checksum,
          name: thumbnailHalfModel.name,
          location: thumbnailHalfModel.location,
        })
      : null;

    const trailerModel = audio_video_medias.find(
      (i) => i.video_related_field === 'trailer',
    );

    const trailer = trailerModel
      ? new AudioVideoMedia({
          checksum: trailerModel.checksum,
          name: trailerModel.name,
          raw_location: trailerModel.raw_location,
          encoded_location: trailerModel.encoded_location,
          status: trailerModel.status,
        })
      : null;

    const videoModel = audio_video_medias.find(
      (i) => i.video_related_field === 'video',
    );

    const video = videoModel
      ? new AudioVideoMedia({
          checksum: videoModel.checksum,
          name: videoModel.name,
          raw_location: videoModel.raw_location,
          encoded_location: videoModel.encoded_location,
          status: videoModel.status,
        })
      : null;

    const [rating] = Rating.create(otherData.rating).asArray();

    const videoEntity = new Video({
      ...otherData,
      rating: rating,
      video_id: new VideoId(id),
      banner,
      thumbnail,
      thumbnail_half: thumbnailHalf,
      trailer,
      video,
      categories_id: new Map(categoriesId.map((c) => [c.id, c])),
      genres_id: new Map(genresId.map((c) => [c.id, c])),
      cast_members_id: new Map(castMembersId.map((c) => [c.id, c])),
    });

    //video.validate();

    // notification.copyErrors(video.notification);

    // if (notification.hasErrors()) {
    //   throw new LoadAggregateError(notification.toJSON());
    // }

    return videoEntity;
  }

  static toModelProps(aggregate: Video) {
    const { categories_id, genres_id, cast_members_id, ...otherData } =
      aggregate.toJSON();
    return {
      ...otherData,
      image_medias: [
        { entity: aggregate.banner, video_related_field: 'banner' },
        { data: aggregate.thumbnail, video_related_field: 'thumbnail' },
        {
          data: aggregate.thumbnail_half,
          video_related_field: 'thumbnail_half',
        },
      ].map((item) => {
        return item.entity
          ? new ImageMediaModel({
              checksum: item.entity.checksum,
              name: item.entity.name,
              location: item.entity.location,
              video_related_field: item.video_related_field as any,
            })
          : null;
      }),

      audio_video_medias: [aggregate.trailer, aggregate.video].map(
        (audio_video_media, index) => {
          return audio_video_media
            ? new AudioVideoMediaModel({
                checksum: audio_video_media.checksum,
                name: audio_video_media.name,
                raw_location: audio_video_media.raw_location,
                encoded_location: audio_video_media.encoded_location,
                status: audio_video_media.status,
                video_related_field: index === 0 ? 'trailer' : 'video',
              })
            : null;
        },
      ),
      categories_id: categories_id.map(
        (category_id) =>
          new VideoCategoryModel({
            video_id: aggregate.video_id.id,
            category_id: category_id,
          }),
      ),
      genres_id: genres_id.map(
        (category_id) =>
          new VideoGenreModel({
            video_id: aggregate.video_id.id,
            genre_id: category_id,
          }),
      ),
      cast_members_id: cast_members_id.map(
        (cast_member_id) =>
          new VideoCastMemberModel({
            video_id: aggregate.video_id.id,
            cast_member_id: cast_member_id,
          }),
      ),
    };
  }
}
