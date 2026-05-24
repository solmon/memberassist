import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [PrismaModule, TenantsModule],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
