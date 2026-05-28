import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventQueryDto } from './dto/health-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listEvents(memberId: string, tenantId: string, query: EventQueryDto) {
    const events = await this.prisma.healthEvent.findMany({
      where: { tenantId, isActive: true },
      include: { rsvps: true },
      orderBy: { startAt: 'asc' },
    });

    return events
      .filter((e) => {
        if (!query.myRsvpOnly) return true;
        return e.rsvps.some((r) => r.memberId === memberId && !r.cancelledAt);
      })
      .map((e) => {
        const myRsvp = e.rsvps.find(
          (r) => r.memberId === memberId && !r.cancelledAt,
        );
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          startAt: e.startAt,
          endAt: e.endAt,
          location: e.location,
          category: e.category,
          capacity: e.capacity,
          rsvpCount: e.rsvps.filter(
            (r) => !r.cancelledAt && r.status === 'ATTENDING',
          ).length,
          myRsvpStatus: myRsvp?.status,
        };
      });
  }

  async findOne(eventId: string, memberId: string, tenantId: string) {
    const event = await this.prisma.healthEvent.findFirst({
      where: { id: eventId, tenantId, isActive: true },
      include: { rsvps: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const myRsvp = event.rsvps.find(
      (r) => r.memberId === memberId && !r.cancelledAt,
    );
    const attendingCount = event.rsvps.filter(
      (r) => !r.cancelledAt && r.status === 'ATTENDING',
    ).length;

    return {
      ...event,
      rsvpCount: attendingCount,
      myRsvpStatus: myRsvp?.status,
      meetingUrl: myRsvp?.status === 'ATTENDING' ? event.meetingUrl : undefined,
      rsvps: undefined,
    };
  }

  async createRsvp(eventId: string, memberId: string, tenantId: string) {
    const event = await this.prisma.healthEvent.findFirst({
      where: { id: eventId, tenantId, isActive: true },
      include: { rsvps: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const existing = event.rsvps.find((r) => r.memberId === memberId);
    if (existing && !existing.cancelledAt) return existing;

    const attendingCount = event.rsvps.filter(
      (r) => !r.cancelledAt && r.status === 'ATTENDING',
    ).length;
    const status =
      !event.capacity || attendingCount < event.capacity
        ? 'ATTENDING'
        : 'WAITLISTED';

    if (existing) {
      return this.prisma.eventRsvp.update({
        where: { id: existing.id },
        data: { cancelledAt: null, status },
      });
    }

    return this.prisma.eventRsvp.create({
      data: { tenantId, eventId, memberId, status },
    });
  }

  async cancelRsvp(eventId: string, memberId: string, tenantId: string) {
    const rsvp = await this.prisma.eventRsvp.findFirst({
      where: { eventId, memberId, tenantId, cancelledAt: null },
    });
    if (!rsvp) throw new NotFoundException('RSVP not found');

    await this.prisma.eventRsvp.update({
      where: { id: rsvp.id },
      data: { cancelledAt: new Date() },
    });

    // Promote first waitlisted member
    if (rsvp.status === 'ATTENDING') {
      const waitlisted = await this.prisma.eventRsvp.findFirst({
        where: { eventId, tenantId, status: 'WAITLISTED', cancelledAt: null },
        orderBy: { registeredAt: 'asc' },
      });
      if (waitlisted) {
        await this.prisma.eventRsvp.update({
          where: { id: waitlisted.id },
          data: { status: 'ATTENDING' },
        });
      }
    }
  }
}
