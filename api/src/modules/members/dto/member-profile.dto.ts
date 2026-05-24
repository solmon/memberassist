import { ApiProperty } from '@nestjs/swagger';

export class MemberProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  memberIdNumber!: string;
}
