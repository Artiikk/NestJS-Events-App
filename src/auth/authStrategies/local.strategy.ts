import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  public async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    const passwordsAreEqual = await bcrypt.compare(password, user.password);

    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException();
    }

    if (!passwordsAreEqual) {
      this.logger.error('Invalid password');
      throw new UnauthorizedException();
    }

    return user;
  }
}
