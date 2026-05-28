import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DependantCardDto {
  @Expose()
  cardholderName!: string;

  @Expose()
  memberIdNumber!: string;

  @Expose()
  groupNumber!: string;

  @Expose()
  planName!: string;

  @Expose()
  effectiveDate!: Date;

  @Expose()
  terminationDate!: Date | null;
}

@Exclude()
export class DependantSummaryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  relationship!: string;

  @Expose()
  dateOfBirth!: Date;

  @Expose()
  isActive!: boolean;

  @Expose()
  coverageStatus!: string;

  @Expose()
  digitalCard!: DependantCardDto | null;
}
