import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeoModule } from './seo/seo.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { ContentService } from './common/services/content.service';
import { BlogModule } from './blog.module';
import { BlogService } from './blog.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/*'],
    }),
    SeoModule,
    AdminModule,
    AnalyticsModule,
    SeedModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService, ContentService, BlogService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // TEMPORARILY DISABLE AuthMiddleware for testing maintenance toggle
    // consumer
    //   .apply(AuthMiddleware)
    //   .exclude(
    //     { path: '/admin/login', method: RequestMethod.GET },
    //     { path: '/admin/login', method: RequestMethod.POST },
    //     { path: '/admin/logout', method: RequestMethod.GET },
    //     { path: '/api/admin', method: RequestMethod.ALL },
    //     { path: '/api/admin/*', method: RequestMethod.ALL }
    //   )
    //   .forRoutes('/admin/*');
    console.log('AuthMiddleware DISABLED for testing');
  } 
}
