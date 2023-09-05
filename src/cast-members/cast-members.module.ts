import { Module } from '@nestjs/common';
import { CastMembersController } from './cast-members.controller';
import * as CastMemberProviders from './cast-members.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import { CastMemberModel } from '../core/cast-member/infra/db/sequelize/cast-member-sequelize';
@Module({
  imports: [SequelizeModule.forFeature([CastMemberModel])],
  controllers: [CastMembersController],
  providers: [
    ...Object.values(CastMemberProviders.REPOSITORIES),
    ...Object.values(CastMemberProviders.USE_CASES),
  ],
})
export class CastMembersModule {}
