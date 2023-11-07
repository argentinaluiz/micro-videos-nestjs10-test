import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CheckIsAdminGuard } from './check-is-admin.guard';

@Global()
@Module({
  imports: [
    //JwtModule.register({ global: true }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          //global: true,
          privateKey: configService.get('JWT_PRIVATE_KEY'),
          publicKey: configService.get('JWT_PUBLIC_KEY'),
          signOptions: {
            algorithm: 'RS256',
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckIsAdminGuard,
    },
  ],
})
export class AuthModule {}
