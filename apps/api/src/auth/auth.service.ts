import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import bycript from 'bcrypt';
import { SALT_ROUNDS } from 'src/constants';
import { formatToApiResponse } from 'src/apiResponse';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userCollection: Model<User>,
    private readonly jwtservice: JwtService,
  ) {}

  async register(createUserDto: RegisterUserDto) {
    const { password, ...payload } = createUserDto;

    const user = await this.userCollection.create({
      ...payload,
      password: bycript.hashSync(password, SALT_ROUNDS),
    });
    // TODO: Return JWT
    return formatToApiResponse({ data: user });
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userCollection.findOne(
      {
        email,
      },
      { email: 1, password: 1 },
    );

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    if (!bycript.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return formatToApiResponse({
      data: user,
      token: this.getJwtToken({ id: user.id }),
    });
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtservice.sign(payload);
    return token;
  }
}
