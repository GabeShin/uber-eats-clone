import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  sign(payload: object): string {
    return jwt.sign(payload, this.configService.get('SECRET_KEY'));
  }

  verify(token: string) {
    return jwt.verify(token, this.configService.get('SECRET_KEY'));
  }
}
