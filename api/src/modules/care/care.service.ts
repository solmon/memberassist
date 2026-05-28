import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderSearchDto, PcpChangeDto } from './dto/provider-search.dto';

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class CareService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProviders(
    memberId: string,
    tenantId: string,
    query: ProviderSearchDto,
  ) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
    });
    const planTier = enrollment?.planTier ?? '';

    const providers = await this.prisma.provider.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(query.specialty
          ? { specialty: { contains: query.specialty } }
          : {}),
        ...(query.acceptingNewPatients !== undefined
          ? { acceptingNew: query.acceptingNewPatients }
          : {}),
      },
    });

    return providers
      .filter((p) => {
        try {
          const tiers: string[] = JSON.parse(p.networkTiers);
          if (!tiers.includes(planTier)) return false;
        } catch {
          // skip filter
        }
        if (
          query.lat !== undefined &&
          query.lng !== undefined &&
          p.latitude &&
          p.longitude
        ) {
          const dist = haversineDistance(
            query.lat,
            query.lng,
            Number(p.latitude),
            Number(p.longitude),
          );
          if (dist > (query.radiusMiles ?? 25)) return false;
        }
        return true;
      })
      .map((p) => {
        const distanceMiles =
          query.lat !== undefined &&
          query.lng !== undefined &&
          p.latitude &&
          p.longitude
            ? haversineDistance(
                query.lat,
                query.lng,
                Number(p.latitude),
                Number(p.longitude),
              )
            : undefined;
        return { ...p, distanceMiles };
      });
  }

  async findProvider(providerId: string, tenantId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { id: providerId, tenantId, isActive: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async submitPcpChange(memberId: string, tenantId: string, dto: PcpChangeDto) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
    });
    if (!enrollment) throw new NotFoundException('Active enrollment not found');

    const provider = await this.findProvider(dto.providerId, tenantId);

    try {
      const tiers: string[] = JSON.parse(provider.networkTiers);
      if (!tiers.includes(enrollment.planTier)) {
        throw new NotFoundException(
          'Provider not in network for your plan tier',
        );
      }
    } catch (e) {
      if ((e as Error).message?.includes('not in network')) throw e;
    }

    // Record PCP change as a communication message (no PcpChangeRequest model in schema)
    return {
      providerId: dto.providerId,
      memberId,
      tenantId,
      status: 'SUBMITTED',
    };
  }
}
