import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthUser, LoginDto } from '@repo/api';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

// Shared by cookie and clearCookie, because the browser only clears a cookie when the options match
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: AuthUser })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async login(
    @Body() dto: LoginDto,
    // passthrough lets us set the cookie and still return the body normally
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(dto);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // httpOnly keeps the token out of reach of JavaScript (XSS protection)
    res.cookie('access_token', token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AuthUser })
  @ApiUnauthorizedResponse()
  me(@Req() req: { user: { sub: number } }) {
    // The guard puts the decoded token on req.user
    return this.authService.getMe(req.user.sub);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOkResponse()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);

    // Return JSON, because the frontend parses the response with res.json()
    return { ok: true };
  }
}
