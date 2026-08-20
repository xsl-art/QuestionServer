import {
  Body,
  Controller,
  Get,
  Post,
  //UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
//import { AuthGuard } from './auth.guard';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() userInfo: { username: string; password: string }) {
    return this.authService.signIn(userInfo.username, userInfo.password);
  }

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
