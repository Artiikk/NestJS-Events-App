import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { LocalStrategy } from './authStrategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './authStrategies/jwt.strategy';
import { UserController } from './users.controller';

@Module({
  // Needed to import the User entity
  imports: [
    TypeOrmModule.forFeature([User]),
    // env variable is not available at this moment
    // JwtModule.register({
    //   secret: process.env.AUTH_SECRET,
    //   signOptions: {
    //     expiresIn: '60m',
    //   },
    // }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '60m',
        },
      }),
    }),
  ],
  providers: [LocalStrategy, JwtStrategy, AuthService],
  controllers: [AuthController, UserController],
})
export class AuthModule {}
