import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { AppJapanService } from './app.japan.service';
import { AppDummy } from './app.dummy';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';

import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd,
    }),
    AuthModule,
    EventsModule,
    SchoolModule,
  ],
  controllers: [AppController],
  providers: [
    // Class Provider
    {
      provide: AppService,
      useClass: AppJapanService,
    },

    // Value Provider
    {
      provide: 'APP_NAME',
      useValue: 'Events Management',
    },

    // Factory Provider
    {
      provide: 'MESSAGE',
      inject: [AppDummy],
      useFactory: (appDummy: AppDummy) => `${appDummy.dummy()} from Factory`,
    },
    AppDummy,
  ],
})
export class AppModule {}
