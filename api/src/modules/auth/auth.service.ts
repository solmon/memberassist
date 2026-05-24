import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';

const BCRYPT_COST = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly tenantsService: TenantsService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const tenant = await this.tenantsService.findBySlug(dto.tenantSlug);

    const member = await this.prisma.member.findFirst({
      where: { tenantId: tenant.id, email: dto.email, isActive: true },
    });

    if (!member || !(await bcrypt.compare(dto.password, member.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.member.update({
      where: { id: member.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(member.id, tenant.id, member.role);
  }

  async refresh(rawRefreshToken: string): Promise<TokenResponseDto> {
    let payload: { sub: string; tenantId: string; role: string };
    try {
      payload = this.jwtService.verify<{
        sub: string;
        tenantId: string;
        role: string;
      }>(rawRefreshToken, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        memberId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!stored || !(await bcrypt.compare(rawRefreshToken, stored.tokenHash))) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(payload.sub, payload.tenantId, payload.role);
  }

  async logout(memberId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { memberId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(memberId: string, tenantId: string) {
    return this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        tenantId: true,
        memberIdNumber: true,
      },
    });
  }

  private async issueTokens(
    memberId: string,
    tenantId: string,
    role: string,
  ): Promise<TokenResponseDto> {
    const accessTtl = Number(this.config.get<number>('JWT_ACCESS_TTL', 900));
    const refreshTtl = Number(this.config.get<number>('JWT_REFRESH_TTL', 2592000));
    const secret = this.config.getOrThrow<string>('JWT_SECRET');

    const payload = { sub: memberId, tenantId, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTtl,
      secret,
    });
    const rawRefresh = this.jwtService.sign(payload, {
      expiresIn: refreshTtl,
      secret,
    });

    const tokenHash = await bcrypt.hash(rawRefresh, BCRYPT_COST);
    await this.prisma.refreshToken.create({
      data: {
        memberId,
        tokenHash,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    return { accessToken, refreshToken: rawRefresh, expiresIn: accessTtl };
  }
}
