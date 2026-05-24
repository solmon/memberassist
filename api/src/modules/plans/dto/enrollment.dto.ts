import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollmentDto {
  @ApiProperty() id!: string;
  @ApiProperty() planTier!: string;
  @ApiProperty() monthlyPremium!: number;
  @ApiProperty() effectiveDate!: Date;
  @ApiProperty() expiryDate!: Date;
  @ApiProperty() deductibleMet!: number;
  @ApiProperty() deductibleLimit!: number;
  @ApiProperty() status!: string;
}

export class EnrollmentHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class DigitalCardDto {
  @ApiProperty() memberId!: string;
  @ApiProperty() memberNumber!: string;
  @ApiProperty() groupNumber!: string;
  @ApiProperty() planTier!: string;
  @ApiProperty() effectiveDate!: Date;
}
