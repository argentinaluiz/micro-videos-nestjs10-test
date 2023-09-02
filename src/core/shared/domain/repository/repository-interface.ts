import Entity from '../entity';
import { ValueObject } from '../value-object';
import { SearchParams, SearchResult } from './search-params';

export interface RepositoryInterface<
  E extends Entity,
  EntityId extends ValueObject,
> {
  insert(entity: E): Promise<void>;
  bulkInsert(entities: E[]): Promise<void>;
  findById(id: EntityId): Promise<E>;
  findAll(): Promise<E[]>;
  update(entity: E): Promise<void>;
  delete(id: EntityId): Promise<void>;
  getEntity(): new (...args: any[]) => E;
}

//category.props.name

//Entidade e Objetos

export interface SearchableRepositoryInterface<
  E extends Entity,
  EntityId extends ValueObject,
  Filter = string,
  SearchInput = SearchParams<Filter>,
  SearchOutput = SearchResult<E, Filter>,
> extends RepositoryInterface<E, EntityId> {
  sortableFields: string[];
  search(props: SearchInput): Promise<SearchOutput>;
}
