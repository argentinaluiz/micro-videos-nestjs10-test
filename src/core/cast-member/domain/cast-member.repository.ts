import { Either } from '../../shared/domain/either';
import { SearchableRepositoryInterface } from '../../shared/domain/repository/repository-interface';
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchParamsConstructorProps,
} from '../../shared/domain/repository/search-params';
import { SearchValidationError } from '../../shared/domain/validators/validation.error';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { CastMemberType, CastMemberTypes } from './cast-member-type.vo';
import { CastMember } from './cast-member.entity';

export type CastMemberFilter = {
  name?: string;
  type?: CastMemberType;
};

export class CastMemberSearchParams extends DefaultSearchParams<CastMemberFilter> {
  private constructor(
    props: SearchParamsConstructorProps<CastMemberFilter> = {},
  ) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
      filter?: {
        name?: string;
        type?: CastMemberTypes;
      };
    } = {},
  ) {
    const [type, errorCastMemberType] = Either.of(props.filter?.type)
      .map((type) => type || null)
      .chain((type) => (type ? CastMemberType.create(type) : Either.of(null)));

    if (errorCastMemberType) {
      const error = new SearchValidationError();
      error.setFromError('type', errorCastMemberType);
      throw error;
    }

    return new CastMemberSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        type: type,
      },
    });
  }

  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value.name && { name: `${_value?.name}` }),
      ...(_value.type && { type: _value.type }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class CastMemberSearchResult extends DefaultSearchResult<CastMember> {}

export interface CastMemberRepository
  extends SearchableRepositoryInterface<
    CastMember,
    Uuid,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
