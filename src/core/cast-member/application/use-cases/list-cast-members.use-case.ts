import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../dto/cast-member-output';
import { IUseCase } from '../../../shared/application/use-case-interface';
import {
  PaginationOutputDto,
  PaginationOutputMapper,
} from '../../../shared/application/pagination-output';
import { SearchInputDto } from '../../../shared/application/search-input';
import {
  CastMemberRepository,
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '../../domain/cast-member.repository';
import { CastMemberTypes } from '../../domain/cast-member-type.vo';

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private castMemberRepo: CastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = CastMemberSearchParams.create(input);
    const searchResult = await this.castMemberRepo.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(
    searchResult: CastMemberSearchResult,
  ): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CastMemberOutputMapper.toOutput(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCastMembersInput = SearchInputDto<{
  name?: string;
  type?: CastMemberTypes;
}>;

export type ListCastMembersOutput = PaginationOutputDto<CastMemberOutput>;
