import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = { sub: number; email: string; role: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      cookies?: Record<string, string>;
      user?: JwtPayload;
    }>();

    const token = request.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // verifyAsync also checks the signature and the expiration date
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
