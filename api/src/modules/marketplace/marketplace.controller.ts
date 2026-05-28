import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { OfferQueryDto } from './dto/offer.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/tenant-id.decorator';

@ApiTags('marketplace')
@ApiBearerAuth()
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get('offers')
  @ApiOperation({ summary: 'List tier-eligible marketplace offers' })
  listOffers(@CurrentUser() user: JwtPayload, @Query() query: OfferQueryDto) {
    return this.service.listOffers(user.sub, user.tenantId, query);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get a marketplace offer' })
  findOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOffer(id, user.tenantId);
  }

  @Post('offers/:id/interest')
  @ApiOperation({ summary: 'Express interest in an offer' })
  expressInterest(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.expressInterest(id, user.sub, user.tenantId);
  }
}
