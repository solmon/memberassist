import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentHistoryQueryDto } from './dto/enrollment.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async getEnrollment(memberId: string, tenantId: string) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
    });
    if (!enrollment) throw new NotFoundException('No active enrollment found');
    return enrollment;
  }

  async getEnrollmentHistory(memberId: string, tenantId: string, query: EnrollmentHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.prisma.planEnrollment.findMany({
      where: { memberId, tenantId },
      orderBy: { effectiveDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getDigitalCard(memberId: string, tenantId: string) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
      include: { digitalCards: true },
    });
    const card = enrollment?.digitalCards?.[0];
    if (!enrollment || !card) throw new NotFoundException('No digital card found');
    return {
      memberId,
      memberNumber: card.memberIdNumber,
      groupNumber: card.groupNumber,
      planTier: enrollment.planTier,
      effectiveDate: enrollment.effectiveDate,
    };
  }
}
