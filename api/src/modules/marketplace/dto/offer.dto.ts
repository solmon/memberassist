import { IsOptional, IsString } from 'class-validator';

export class OfferDto {
  id!: string;
  title!: string;
  description!: string;
  category!: string;
  eligibleTiers!: string;
  priceAmount?: number;
  priceCycle?: string;
}

export class OfferQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  page?: number;
}

export class ExpressInterestDto {}
