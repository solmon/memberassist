import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/tenant-id.decorator';

@ApiTags('dependents')
@ApiBearerAuth()
@Controller('dependents')
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Get()
  @ApiOperation({ summary: 'List dependents' })
  list(@CurrentUser() user: JwtPayload) {
    return this.dependentsService.listForMember(user.sub, user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Add dependent' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDependentDto) {
    return this.dependentsService.create(user.sub, user.tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dependent with card' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dependentsService.findOneWithCard(id, user.sub, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove dependent' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dependentsService.softDelete(id, user.sub, user.tenantId);
  }
}
