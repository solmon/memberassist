import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantConfigDto } from './dto/tenant-config.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException(`Tenant '${slug}' not found`);
    return tenant;
  }

  async getConfig(tenantId: string): Promise<TenantConfigDto> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      brandingColor: tenant.primaryColour ?? '#1976D2',
      features: [],
    };
  }
}
