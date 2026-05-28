import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { DependantSummaryResponseDto } from './dto/dependant-list.dto';
import { PlanSummaryResponseDto } from './dto/plan-summary.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsService: TenantsService,
  ) {}

  async getProfile(memberId: string, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        tenantId: true,
        memberIdNumber: true,
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async updateProfile(
    memberId: string,
    tenantId: string,
    dto: UpdateMemberDto,
  ) {
    await this.prisma.member.findFirst({ where: { id: memberId, tenantId } });
    return this.prisma.member.update({
      where: { id: memberId },
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        tenantId: true,
        memberIdNumber: true,
      },
    });
  }

  async getTenantConfig(tenantId: string) {
    return this.tenantsService.getConfig(tenantId);
  }

  async getPlanSummary(
    memberId: string,
    tenantId: string,
  ): Promise<PlanSummaryResponseDto[]> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
      select: { id: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    const enrollments = await this.prisma.planEnrollment.findMany({
      where: {
        tenantId,
        memberId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      select: {
        id: true,
        planName: true,
        planType: true,
        planTier: true,
        groupNumber: true,
        effectiveDate: true,
        terminationDate: true,
        nextRenewalDate: true,
        status: true,
        premiumAmount: true,
        deductibleLimit: true,
        deductibleMet: true,
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberIdNumber: true,
          },
        },
      },
      orderBy: [{ planType: 'asc' }, { effectiveDate: 'desc' }],
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      planName: enrollment.planName,
      planType: enrollment.planType,
      planTier: enrollment.planTier,
      groupNumber: enrollment.groupNumber,
      effectiveDate: enrollment.effectiveDate,
      terminationDate: enrollment.terminationDate,
      nextRenewalDate: enrollment.nextRenewalDate,
      status: enrollment.status,
      monthlyPremium: Number(enrollment.premiumAmount),
      deductibleLimit:
        enrollment.deductibleLimit === null
          ? null
          : Number(enrollment.deductibleLimit),
      deductibleMet:
        enrollment.deductibleMet === null
          ? null
          : Number(enrollment.deductibleMet),
      memberIdNumber: enrollment.member.memberIdNumber,
      firstName: enrollment.member.firstName,
      lastName: enrollment.member.lastName,
    }));
  }

  async getDependants(
    memberId: string,
    tenantId: string,
  ): Promise<DependantSummaryResponseDto[]> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
      select: { id: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    const dependants = await this.prisma.dependent.findMany({
      where: {
        tenantId,
        memberId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationship: true,
        dateOfBirth: true,
        isActive: true,
        digitalCards: {
          select: {
            cardholderName: true,
            memberIdNumber: true,
            groupNumber: true,
            planName: true,
            effectiveDate: true,
            terminationDate: true,
            enrollment: { select: { status: true } },
          },
          take: 1,
          orderBy: { effectiveDate: 'desc' },
        },
      },
      orderBy: [{ relationship: 'asc' }, { firstName: 'asc' }],
    });

    return dependants.map((dependant) => {
      const card = dependant.digitalCards[0];

      return {
        id: dependant.id,
        firstName: dependant.firstName,
        lastName: dependant.lastName,
        relationship: dependant.relationship,
        dateOfBirth: dependant.dateOfBirth,
        isActive: dependant.isActive,
        coverageStatus: card?.enrollment?.status ?? 'UNKNOWN',
        digitalCard: card
          ? {
              cardholderName: card.cardholderName,
              memberIdNumber: card.memberIdNumber,
              groupNumber: card.groupNumber,
              planName: card.planName,
              effectiveDate: card.effectiveDate,
              terminationDate: card.terminationDate,
            }
          : null,
      };
    });
  }
}
