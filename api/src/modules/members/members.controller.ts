import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { DependantSummaryResponseDto } from './dto/dependant-list.dto';
import { PlanSummaryResponseDto } from './dto/plan-summary.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/tenant-id.decorator';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get member profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.membersService.getProfile(user.sub, user.tenantId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update member profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMemberDto) {
    return this.membersService.updateProfile(user.sub, user.tenantId, dto);
  }

  @Get('tenant-config')
  @ApiOperation({ summary: 'Get tenant config for current member' })
  getTenantConfig(@CurrentUser() user: JwtPayload) {
    return this.membersService.getTenantConfig(user.tenantId);
  }

  @Get('me/plan-summary')
  @ApiOperation({ summary: 'Get member plan summary' })
  getPlanSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<PlanSummaryResponseDto[]> {
    return this.membersService.getPlanSummary(user.sub, user.tenantId);
  }

  @Get('me/dependants')
  @ApiOperation({ summary: 'Get member dependants list' })
  getDependants(
    @CurrentUser() user: JwtPayload,
  ): Promise<DependantSummaryResponseDto[]> {
    return this.membersService.getDependants(user.sub, user.tenantId);
  }
}
