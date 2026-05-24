import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProviderSearchDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusMiles?: number = 25;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptingNewPatients?: boolean;
}

export class PcpChangeDto {
  providerId!: string;
}
