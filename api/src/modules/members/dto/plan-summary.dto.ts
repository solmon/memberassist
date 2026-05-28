import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PlanSummaryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  planName!: string;

  @Expose()
  planType!: string;

  @Expose()
  planTier!: string;

  @Expose()
  groupNumber!: string;

  @Expose()
  effectiveDate!: Date;

  @Expose()
  terminationDate!: Date | null;

  @Expose()
  nextRenewalDate!: Date | null;

  @Expose()
  status!: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  monthlyPremium!: number;

  @Expose()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  deductibleLimit!: number | null;

  @Expose()
  @Transform(({ value }) => (value === null ? null : Number(value)))
  deductibleMet!: number | null;

  @Expose()
  memberIdNumber!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;
}
