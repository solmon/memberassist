import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { EnrollmentHistoryQueryDto } from './dto/enrollment.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/tenant-id.decorator';

@ApiTags('plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('enrollment')
  @ApiOperation({ summary: 'Get active enrollment' })
  getEnrollment(@CurrentUser() user: JwtPayload) {
    return this.plansService.getEnrollment(user.sub, user.tenantId);
  }

  @Get('enrollment/history')
  @ApiOperation({ summary: 'Get enrollment history' })
  getEnrollmentHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: EnrollmentHistoryQueryDto,
  ) {
    return this.plansService.getEnrollmentHistory(user.sub, user.tenantId, query);
  }

  @Get('enrollment/card')
  @ApiOperation({ summary: 'Get digital insurance card' })
  getDigitalCard(@CurrentUser() user: JwtPayload) {
    return this.plansService.getDigitalCard(user.sub, user.tenantId);
  }
}
