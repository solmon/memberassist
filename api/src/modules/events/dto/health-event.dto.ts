import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class EventDto {
  id!: string;
  title!: string;
  description!: string;
  startAt!: string;
  endAt!: string;
  location?: string;
  category!: string;
  capacity?: number;
  rsvpCount!: number;
  myRsvpStatus?: string;
}

export class EventQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  myRsvpOnly?: boolean;
}

export class RsvpResponseDto {
  status!: string;
  eventId!: string;
  memberId!: string;
}
