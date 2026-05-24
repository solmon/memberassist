import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DigitalCardDto } from '../../plans/dto/enrollment.dto';

export class DependentDto {
  @ApiProperty() id!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() dateOfBirth!: Date;
  @ApiProperty() relationship!: string;
  @ApiPropertyOptional({ type: () => DigitalCardDto })
  digitalCard?: DigitalCardDto;
}
