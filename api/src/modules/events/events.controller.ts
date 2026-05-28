import { Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventQueryDto } from './dto/health-event.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/tenant-id.decorator';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List health events' })
  listEvents(@CurrentUser() user: JwtPayload, @Query() query: EventQueryDto) {
    return this.service.listEvents(user.sub, user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event detail' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(id, user.sub, user.tenantId);
  }

  @Post(':id/rsvp')
  @ApiOperation({ summary: 'RSVP to an event' })
  createRsvp(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.createRsvp(id, user.sub, user.tenantId);
  }

  @Delete(':id/rsvp')
  @ApiOperation({ summary: 'Cancel RSVP' })
  cancelRsvp(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.cancelRsvp(id, user.sub, user.tenantId);
  }
}
