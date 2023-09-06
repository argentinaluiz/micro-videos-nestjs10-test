import {
  Column,
  DataType,
  PrimaryKey,
  Table,
  Model,
} from 'sequelize-typescript';

import { literal, Op } from 'sequelize';
import { Category, CategoryId } from '../../../domain/category.aggregate';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { LoadAggregateError } from '../../../../shared/domain/validators/validation.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  ICategoryRepository,
  CategorySearchParams,
  CategorySearchResult,
} from '../../../domain/category.repository';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';

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

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };
  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(aggregate: Category): Promise<void> {
    await this.categoryModel.create(aggregate.toJSON());
  }

  async bulkInsert(aggregates: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(aggregates.map((e) => e.toJSON()));
  }

  async findById(id: CategoryId): Promise<Category> {
    const model = await this._get(id.id);
    return model ? CategoryModelMapper.toAggregate(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((m) => CategoryModelMapper.toAggregate(m));
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toAggregate(m));
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ exists: CategoryId[]; not_exists: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['category_id'],
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.category_id),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      not_exists: notExistsCategoryIds,
    };
  }

  async update(aggregate: Category): Promise<void> {
    const model = await this._get(aggregate.category_id.id);
    if (!model) {
      throw new NotFoundError(aggregate.category_id.id, this.getAggregate());
    }
    await this.categoryModel.update(aggregate.toJSON(), {
      where: { category_id: aggregate.category_id.id },
    });
  }
  async delete(id: CategoryId): Promise<void> {
    const model = await this._get(id.id);
    if (!model) {
      throw new NotFoundError(id.id, this.getAggregate());
    }
    this.categoryModel.destroy({ where: { category_id: id.id } });
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
      items: models.map((m) => CategoryModelMapper.toAggregate(m)),
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

  getAggregate(): new (...args: any[]) => Category {
    return Category;
  }
}

export class CategoryModelMapper {
  static toAggregate(model: CategoryModel) {
    const { category_id: id, ...otherData } = model.toJSON();
    const category = new Category({
      ...otherData,
      category_id: new CategoryId(id),
    });
    category.validate();
    if (category.notification.hasErrors()) {
      throw new LoadAggregateError(category.notification.toJSON());
    }
    return category;
  }
}
