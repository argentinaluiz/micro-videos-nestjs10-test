import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
} from 'sequelize-typescript';

import { literal, Op } from 'sequelize';
import { CastMember } from '../../../domain/cast-member.entity';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import {
  EntityValidationError,
  LoadEntityError,
} from '../../../../shared/domain/validators/validation.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  CastMemberRepository,
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '../../../domain/cast-member.repository';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../../domain/cast-member-type.vo';

export type CastMemberModelProps = {
  cast_member_id: string;
  name: string;
  type: CastMemberTypes;
  created_at: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export class CastMemberModel extends Model<CastMemberModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare cast_member_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({
    allowNull: false,
    type: DataType.SMALLINT,
  })
  declare type: CastMemberTypes;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;
}

export class CastMemberSequelizeRepository implements CastMemberRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };
  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    await this.castMemberModel.create(entity.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    await this.castMemberModel.bulkCreate(entities.map((e) => e.toJSON()));
  }

  async findById(entity_id: Uuid): Promise<CastMember> {
    const model = await this._get(entity_id.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((m) => CastMemberModelMapper.toEntity(m));
  }

  async update(entity: CastMember): Promise<void> {
    const model = await this._get(entity.cast_member_id.id);
    if (!model) {
      throw new NotFoundError(entity.cast_member_id.id, this.getEntity());
    }
    await this.castMemberModel.update(entity.toJSON(), {
      where: { cast_member_id: entity.cast_member_id.id },
    });
  }
  async delete(entity_id: Uuid): Promise<void> {
    const _id = `${entity_id}`;
    const model = await this._get(_id);
    if (!model) {
      throw new NotFoundError(entity_id.id, this.getEntity());
    }
    this.castMemberModel.destroy({ where: { cast_member_id: _id } });
  }

  private async _get(id: string): Promise<CastMemberModel> {
    return this.castMemberModel.findByPk(id);
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const where = {};

    if (props.filter && (props.filter.name || props.filter.type)) {
      if (props.filter.name) {
        where['name'] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (props.filter.type) {
        where['type'] = props.filter.type.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir) }
        : { order: [['created_at', 'DESC']] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: models.map((m) => CastMemberModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}

export class CastMemberModelMapper {
  static toEntity(model: CastMemberModel) {
    const { cast_member_id: id, ...otherData } = model.toJSON();
    const [type, errorCastMemberType] = CastMemberType.create(
      otherData.type as any,
    ).asArray();
    try {
      const castMember = new CastMember({
        ...otherData,
        cast_member_id: new Uuid(id),
        type,
      });
      CastMember.validate(castMember);
      return castMember;
    } catch (e) {
      if (e instanceof EntityValidationError) {
        e.setFromError('type', errorCastMemberType);
        throw new LoadEntityError(e.error);
      }

      throw e;
    }
  }
}
