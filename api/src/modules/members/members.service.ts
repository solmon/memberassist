import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
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

  async updateProfile(memberId: string, tenantId: string, dto: UpdateMemberDto) {
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
}
