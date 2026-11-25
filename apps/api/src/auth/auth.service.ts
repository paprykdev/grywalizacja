import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthUser, LoginDto } from '@repo/api';

import { PrismaService } from '../prisma/prisma.service';
import { verifyPassword } from './password.util';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<AuthUser> {
    // Emails are stored in lowercase, so normalize before the lookup
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // One message for every failure, so attackers can't tell which emails exist
    if (
      !user ||
      !user.passwordHash ||
      !(await verifyPassword(user.passwordHash, dto.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Checked after the password, so only the real owner learns the status
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    // Pick fields one by one so passwordHash can never leak
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };
  }

  async getMe(userId: number): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Re-check the database, so a blocked or deleted user loses access at once
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };
  }
}
