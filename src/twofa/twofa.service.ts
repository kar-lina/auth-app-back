import { Inject, Injectable, forwardRef } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwofaService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return await this.generateQrCodeDataURL(user.email, secret);
  }
  async disableTwoFactorAuthenticationSecret(user: User) {
    if (user.twoFactorAuthenticationSecret) {
      await this.usersService.turnOffTwoFactorAuthentication(user.id);
    }
  }
  async enableTwoFactorAuthenticationSecret(user: User) {
    if (user.twoFactorAuthenticationSecret) {
      await this.usersService.turnOnTwoFactorAuthentication(user.id);
      return await this.generateQrCodeDataURL(
        user.email,
        user.twoFactorAuthenticationSecret,
        this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      );
    } else {
      return await this.generateTwoFactorAuthenticationSecret(user);
    }
  }
  async generateQrCodeDataURL(
    userEmail: string,
    secret: string,
    serviceName = this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
  ) {
    const url = authenticator.keyuri(userEmail, serviceName, secret);
    return {
      otpauthUrl: await toDataURL(url),
      secret,
    };
  }
  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
