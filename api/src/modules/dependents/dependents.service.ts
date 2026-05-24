import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDependentDto } from './dto/create-dependent.dto';

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForMember(memberId: string, tenantId: string) {
    return this.prisma.dependent.findMany({
      where: { memberId, tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(memberId: string, tenantId: string, dto: CreateDependentDto) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { id: dto.enrollmentId, memberId, tenantId, status: 'ACTIVE' },
    });
    if (!enrollment) throw new NotFoundException('Active enrollment not found');

    const dependent = await this.prisma.dependent.create({
      data: {
        memberId,
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        relationship: dto.relationship,
        memberIdNumber: `${enrollment.groupNumber}-D-${Date.now()}`,
      },
    });

    await this.prisma.digitalInsuranceCard.create({
      data: {
        tenantId,
        enrollmentId: enrollment.id,
        dependentId: dependent.id,
        cardholderName: `${dto.firstName} ${dto.lastName}`,
        memberIdNumber: dependent.memberIdNumber,
        groupNumber: enrollment.groupNumber,
        planName: enrollment.planName,
        planTier: enrollment.planTier,
        effectiveDate: enrollment.effectiveDate,
        issuedAt: new Date(),
      },
    });

    return dependent;
  }

  async findOneWithCard(dependentId: string, memberId: string, tenantId: string) {
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dependentId, memberId, tenantId, isActive: true },
      include: { digitalCards: true },
    });
    if (!dependent) throw new NotFoundException('Dependent not found');
    return dependent;
  }

  async softDelete(dependentId: string, memberId: string, tenantId: string) {
    const dep = await this.prisma.dependent.findFirst({
      where: { id: dependentId, memberId, tenantId, isActive: true },
    });
    if (!dep) throw new NotFoundException('Dependent not found');
    await this.prisma.dependent.update({
      where: { id: dependentId },
      data: { isActive: false },
    });
  }
}
