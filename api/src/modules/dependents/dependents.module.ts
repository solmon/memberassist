import { Module } from '@nestjs/common';
import { DependentsService } from './dependents.service';
import { DependentsController } from './dependents.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DependentsService],
  controllers: [DependentsController],
})
export class DependentsModule {}
