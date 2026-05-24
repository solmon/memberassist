import { IsString, IsDateString, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const RELATIONSHIPS = ['SPOUSE', 'CHILD', 'DOMESTIC_PARTNER', 'OTHER'] as const;
type Relationship = typeof RELATIONSHIPS[number];

export class CreateDependentDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ enum: RELATIONSHIPS })
  @IsIn(RELATIONSHIPS)
  relationship!: Relationship;

  @ApiProperty()
  @IsUUID()
  enrollmentId!: string;
}
