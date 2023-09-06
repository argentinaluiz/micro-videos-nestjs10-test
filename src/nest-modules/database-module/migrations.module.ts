import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { ConfigModule } from '../config-module/config.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
})
export class MigrationModule {}
