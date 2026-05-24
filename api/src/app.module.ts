import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { MembersModule } from './modules/members/members.module';
import { PlansModule } from './modules/plans/plans.module';
import { DependentsModule } from './modules/dependents/dependents.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { EventsModule } from './modules/events/events.module';
import { CareModule } from './modules/care/care.module';
import { GlobalJwtAuthGuard } from './common/guards/global-jwt-auth.guard';
import { PhiRedactionInterceptor } from './common/interceptors/phi-redaction.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    MembersModule,
    PlansModule,
    DependentsModule,
    CommunicationsModule,
    MarketplaceModule,
    EventsModule,
    CareModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GlobalJwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: PhiRedactionInterceptor },
  ],
})
export class AppModule {}
