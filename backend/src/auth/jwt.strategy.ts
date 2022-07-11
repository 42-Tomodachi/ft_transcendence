import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private accessTokens: Set<string> = new Set<string>(),
  ) {
    super({
      secretOrKey: process.env.EC2_JWT_SECRET || process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  getJwtAccessToken = (id: number): string => {
    return this.accessTokens[id];
  };

  setJwtAccessToken = (id: number, accessToken: string): void => {
    this.accessTokens[id] = accessToken;
  };

  deletejwtAccessToken(id: number) {
    this.accessTokens[id].delete();
  }

  async validate(payload) {
    const { email } = payload;
    const { id } = payload;
    const { inputToken } = payload;
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('회원이 아닙니다.');
    }
    if (this.accessTokens[id] != inputToken) {
      throw new Error('잘못된 토큰입니다.');
    }
    return user;
  }
}

export const GetJwtUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
