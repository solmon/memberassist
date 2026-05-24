import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageQueryDto, UnreadCountsDto } from './dto/message.dto';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMessages(memberId: string, tenantId: string, query: MessageQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const member = await this.prisma.member.findFirst({ where: { id: memberId, tenantId } });

    return this.prisma.communicationMessage.findMany({
      where: {
        tenantId,
        ...(member?.districtId ? { districtId: member.districtId } : {}),
        ...(query.channel ? { channel: query.channel } : {}),
      },
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOneAndMarkRead(messageId: string, memberId: string, tenantId: string) {
    const msg = await this.prisma.communicationMessage.findFirst({
      where: { id: messageId, tenantId },
    });
    if (!msg) throw new NotFoundException('Message not found');

    if (!msg.readAt) {
      return this.prisma.communicationMessage.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });
    }
    return msg;
  }

  async markRead(messageId: string, memberId: string, tenantId: string) {
    return this.findOneAndMarkRead(messageId, memberId, tenantId);
  }

  async getUnreadCounts(memberId: string, tenantId: string): Promise<UnreadCountsDto> {
    const member = await this.prisma.member.findFirst({ where: { id: memberId, tenantId } });
    const districtFilter = member?.districtId ? { districtId: member.districtId } : {};

    const [brokerUnread, districtUnread] = await Promise.all([
      this.prisma.communicationMessage.count({
        where: { tenantId, channel: 'BROKER_NOTICE', readAt: null, ...districtFilter },
      }),
      this.prisma.communicationMessage.count({
        where: { tenantId, channel: 'DISTRICT_ALERT', readAt: null, ...districtFilter },
      }),
    ]);

    return { brokerUnread, districtUnread };
  }
}
