import { PartialType, OmitType } from '@nestjs/swagger';
import { MemberProfileDto } from './member-profile.dto';

export class UpdateMemberDto extends PartialType(
  OmitType(MemberProfileDto, [
    'id',
    'tenantId',
    'role',
    'memberIdNumber',
  ] as const),
) {}
