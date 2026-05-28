import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OfferQueryDto } from './dto/offer.dto';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async listOffers(memberId: string, tenantId: string, query: OfferQueryDto) {
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
    });
    const planTier = enrollment?.planTier ?? '';

    const offers = await this.prisma.marketplaceOffer.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(query.category ? { category: query.category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers
      .filter((o) => {
        try {
          const tiers: string[] = JSON.parse(o.eligibleTiers);
          return tiers.includes(planTier);
        } catch {
          return true;
        }
      })
      .map((o) => ({
        ...o,
        priceAmount: o.priceAmount != null ? o.priceAmount.toNumber() : null,
      }));
  }

  async findOffer(offerId: string, tenantId: string) {
    const offer = await this.prisma.marketplaceOffer.findFirst({
      where: { id: offerId, tenantId, isActive: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return {
      ...offer,
      priceAmount:
        offer.priceAmount != null ? offer.priceAmount.toNumber() : null,
    };
  }

  async expressInterest(offerId: string, memberId: string, tenantId: string) {
    const offer = await this.findOffer(offerId, tenantId);
    const enrollment = await this.prisma.planEnrollment.findFirst({
      where: { memberId, tenantId, status: 'ACTIVE' },
    });
    if (!enrollment) throw new NotFoundException('Active enrollment not found');

    return this.prisma.marketplaceInterest.upsert({
      where: {
        offerId_enrollmentId: {
          offerId: offer.id,
          enrollmentId: enrollment.id,
        },
      },
      update: {},
      create: {
        tenantId,
        offerId: offer.id,
        enrollmentId: enrollment.id,
      },
    });
  }
}
