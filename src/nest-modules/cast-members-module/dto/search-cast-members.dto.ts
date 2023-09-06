import { Transform } from 'class-transformer';
import { ListCastMembersInput } from '../../core/cast-member/application/use-cases/list-cast-members.use-case';
import { SortDirection } from '../../core/shared/domain/repository/search-params';
import { CastMemberTypes } from '../../core/cast-member/domain/cast-member-type.vo';

export class SearchCastMemberDto implements ListCastMembersInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @Transform(({ value }) => {
    if (value) {
      return {
        ...(value.name && { name: value.name }),
        ...(value.type && {
          // NaN será considerado como undefined ou null lá no SearchParams, então verificamos se é um número para manter o valor inválido original
          type: !Number.isNaN(parseInt(value.type))
            ? parseInt(value.type)
            : value.type,
        }),
      };
    }

    return value;
  })
  filter?: {
    name?: string;
    type?: CastMemberTypes;
  };
}
