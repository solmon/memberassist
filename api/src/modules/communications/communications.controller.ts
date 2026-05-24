import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { MessageQueryDto } from './dto/message.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/tenant-id.decorator';

@ApiTags('communications')
@ApiBearerAuth()
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Get('messages')
  @ApiOperation({ summary: 'List messages' })
  listMessages(@CurrentUser() user: JwtPayload, @Query() query: MessageQueryDto) {
    return this.service.listMessages(user.sub, user.tenantId, query);
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get message and mark read' })
  getMessage(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOneAndMarkRead(id, user.sub, user.tenantId);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark message read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.markRead(id, user.sub, user.tenantId);
  }

  @Get('unread-counts')
  @ApiOperation({ summary: 'Get unread message counts' })
  getUnreadCounts(@CurrentUser() user: JwtPayload) {
    return this.service.getUnreadCounts(user.sub, user.tenantId);
  }
}
