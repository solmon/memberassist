import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantConfigDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  brandingColor!: string;

  @ApiProperty({ type: [String] })
  features!: string[];

  @ApiPropertyOptional()
  districtName?: string;
}
