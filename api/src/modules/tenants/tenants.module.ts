import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
