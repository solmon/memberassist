import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CareService } from './care.service';
import { ProviderSearchDto, PcpChangeDto } from './dto/provider-search.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/tenant-id.decorator';

@ApiTags('care')
@ApiBearerAuth()
@Controller('care')
export class CareController {
  constructor(private readonly service: CareService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Search in-network providers' })
  searchProviders(@CurrentUser() user: JwtPayload, @Query() query: ProviderSearchDto) {
    return this.service.searchProviders(user.sub, user.tenantId, query);
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get provider detail' })
  findProvider(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findProvider(id, user.tenantId);
  }

  @Post('pcp-selection')
  @ApiOperation({ summary: 'Submit PCP change request' })
  submitPcpChange(@CurrentUser() user: JwtPayload, @Body() dto: PcpChangeDto) {
    return this.service.submitPcpChange(user.sub, user.tenantId, dto);
  }
}
