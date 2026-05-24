import { IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MESSAGE_CHANNELS = ['BROKER_NOTICE', 'DISTRICT_ALERT', 'SYSTEM'] as const;

export class MessageDto {
  @ApiProperty() id!: string;
  @ApiProperty() subject!: string;
  @ApiProperty() body!: string;
  @ApiProperty() channel!: string;
  @ApiPropertyOptional() readAt?: Date;
  @ApiProperty() sentAt!: Date;
  @ApiPropertyOptional() senderName?: string;
}

export class MessageQueryDto {
  @ApiPropertyOptional({ enum: MESSAGE_CHANNELS })
  @IsOptional()
  @IsIn(MESSAGE_CHANNELS)
  channel?: string;

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

export class UnreadCountsDto {
  @ApiProperty() brokerUnread!: number;
  @ApiProperty() districtUnread!: number;
}
