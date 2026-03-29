import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtUser } from './auth.types';

type JwtPayload = {
  sub: string;
  role: JwtUser['role'];
  email: string | null;
  branchId?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'super_secret_key',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    // вњ… now includes branchId
    return { userId: payload.sub, role: payload.role, email: payload.email, branchId: payload.branchId ?? null } as any;
  }
}
