import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  //依赖注入
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(userData: CreateUserDto) {
    const createdUser = new this.userModel(userData);
    return await createdUser.save();
  }

  async findOne(username: string, password: string) {
    return await this.userModel.findOne({ username, password });
  }

  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }

  async login(username: string, password: string) {
    const user = await this.findOne(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...userInfo } = user.toObject();
    return {
      token: this.jwtService.sign({ userInfo }),
    };
  }
}
