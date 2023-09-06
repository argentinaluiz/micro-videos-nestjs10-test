import { PartialType } from '@nestjs/mapped-types';
import { CreateCastMemberDto } from './create-cast-member.dto';
import { UpdateCastMemberInput } from '../../core/cast-member/application/use-cases/update-cast-member.use-case';

export class UpdateCastMemberDto
  extends PartialType(CreateCastMemberDto)
  implements Omit<UpdateCastMemberInput, 'id'> {}
