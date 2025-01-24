import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './input/create-user.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('users')
export class UserController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = new User();

    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const exisingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (exisingUser) {
      throw new BadRequestException('User already exists');
    }

    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = await this.authService.hashPassword(createUserDto.password);
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    const savedUser = await this.userRepository.save(user);

    if (!savedUser) {
      throw new BadRequestException('User could not be created');
    }

    return {
      ...savedUser,
      token: this.authService.getTokenForUser(user),
    };
  }
}
