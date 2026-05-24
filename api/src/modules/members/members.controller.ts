import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/tenant-id.decorator';

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
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateProfile(user.sub, user.tenantId, dto);
  }

  @Get('tenant-config')
  @ApiOperation({ summary: 'Get tenant config for current member' })
  getTenantConfig(@CurrentUser() user: JwtPayload) {
    return this.membersService.getTenantConfig(user.tenantId);
  }
}
