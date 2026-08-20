import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthenticatedRequest } from '../types/express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    try {
      return await this.userService.create(userDto);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '注册失败';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('login')
  async login(@Body() userInfo: { username: string; password: string }) {
    return this.userService.login(userInfo.username, userInfo.password);
  }

  @Get('info')
  async getUserInfo(@Request() req: AuthenticatedRequest) {
    const { username } = req.user.userInfo;
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    const { nickname } = user;
    return { username, nickname };
  }
}
