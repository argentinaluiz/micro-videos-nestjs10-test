import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
} from 'sequelize-typescript';

import { literal, Op } from 'sequelize';
import { Category } from '../../../domain/category.entity';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import {
  EntityValidationError,
  LoadEntityError,
} from '../../../../shared/domain/validators/validation.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  CategoryRepository,
  CategorySearchParams,
  CategorySearchResult,
} from '../../../domain/category.repository';

export type CategoryModelProps = {
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

@Table({ tableName: 'categories', timestamps: false })
export class CategoryModel extends Model<CategoryModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare category_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string | null;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare is_active: boolean;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;
}

export class CategorySequelizeRepository implements CategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };
  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create(entity.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(entities.map((e) => e.toJSON()));
  }

  async findById(entity_id: Uuid): Promise<Category> {
    const model = await this._get(entity_id.id);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  async update(entity: Category): Promise<void> {
    const model = await this._get(entity.category_id.id);
    if (!model) {
      throw new NotFoundError(entity.category_id.id, this.getEntity());
    }
    await this.categoryModel.update(entity.toJSON(), {
      where: { category_id: entity.category_id.id },
    });
  }
  async delete(entity_id: Uuid): Promise<void> {
    const _id = `${entity_id}`;
    const model = await this._get(_id);
    if (!model) {
      throw new NotFoundError(entity_id.id, this.getEntity());
    }
    this.categoryModel.destroy({ where: { category_id: _id } });
  }

  private async _get(id: string): Promise<CategoryModel> {
    return this.categoryModel.findByPk(id);
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: { name: { [Op.like]: `%${props.filter}%` } },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir) }
        : { order: [['created_at', 'DESC']] }),
      offset,
      limit,
    });
    return new CategorySearchResult({
      items: models.map((m) => CategoryModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.categoryModel.sequelize.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}

export class CategoryModelMapper {
  static toEntity(model: CategoryModel) {
    const { category_id: id, ...otherData } = model.toJSON();
    const category = new Category({
      ...otherData,
      category_id: new Uuid(id),
    });
    category.validate();
    if (category.notification.hasErrors()) {
      throw new LoadEntityError(category.notification.toJSON());
    }
    return category;
  }
}
