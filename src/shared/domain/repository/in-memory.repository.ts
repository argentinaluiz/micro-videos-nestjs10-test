import Entity from "../entity";
import { NotFoundError } from "../errors/not-found.error";
import { ValueObject } from "../value-object";
import {
  RepositoryInterface,
  SearchableRepositoryInterface,
} from "./repository-interface";
import { SearchParams, SearchResult, SortDirection } from "./search-params";

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject
> implements RepositoryInterface<E, EntityId>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async findById(id: EntityId): Promise<E> {
    return this._get(id);
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  async update(entity: E): Promise<void> {
    const hasFound = await this._get(entity.entity_id as EntityId);
    if (!hasFound) {
        throw new NotFoundError(entity.entity_id.value, this.getEntity())
    }
    const indexFound = this.items.findIndex((i) => i.entity_id.equals(entity.entity_id));
    this.items[indexFound] = entity;
  }

  async delete(id: EntityId): Promise<void> {
    await this._get(id);
    const indexFound = this.items.findIndex((i) => i.entity_id.equals(id));
    if(indexFound < 0){
        throw new NotFoundError(id.value, this.getEntity())
    }
    this.items.splice(indexFound, 1);
  }

  protected async _get(id: EntityId): Promise<E> {
    const item = this.items.find((i) => i.entity_id.equals(id));
    return typeof item === "undefined" ? null : item;
  }

  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends ValueObject,
    Filter = string
  >
  extends InMemoryRepository<E, EntityId>
  implements SearchableRepositoryInterface<E, EntityId, Filter>
{
  sortableFields: string[] = [];

  async search(props: SearchParams<Filter>): Promise<SearchResult<E, Filter>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = await this.applySort(
      itemsFiltered,
      props.sort,
      props.sort_dir
    );
    const itemsPaginated = await this.applyPaginate(
      itemsSorted,
      props.page,
      props.per_page
    );
    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      current_page: props.page,
      per_page: props.per_page,
      sort: props.sort,
      sort_dir: props.sort_dir,
      filter: props.filter,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null
  ): Promise<E[]>;

  protected async applySort(
    items: E[],
    sort: string | null,
    sort_dir: SortDirection | null,
    custom_getter?: (sort: string, item: E) => any
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      //@ts-expect-error - ignore
      const aValue = custom_getter ? custom_getter(sort, a) : a[sort];
      //@ts-expect-error - ignore
      const bValue = custom_getter ? custom_getter(sort, b) : b[sort];
      if (aValue < bValue) {
        return sort_dir === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort_dir === "asc" ? 1 : -1;
      }

      return 0;
    });
  }

  protected async applyPaginate(
    items: E[],
    page: SearchParams["page"],
    per_page: SearchParams["per_page"]
  ): Promise<E[]> {
    const start = (page - 1) * per_page; // 1 * 15 = 15
    const limit = start + per_page; // 15 + 15 = 30
    return items.slice(start, limit);
  }
}