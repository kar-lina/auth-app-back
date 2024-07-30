import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('2fa')
export class TwofaController {
  constructor(private readonly twofaService: TwofaService) {}

  @Post('/turn-on')
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuthentication(
    @Req() request,
    // @Body() body,
  ): Promise<{ otpauthUrl: string }> {
    // console.log('request.user', request.user);
    return await this.twofaService.enableTwoFactorAuthenticationSecret(
      request.user,
    );
  }
  @Get('/qr-code')
  @UseGuards(AuthGuard('jwt'))
  async getQRCode(
    @Req() request,
  ): Promise<{ otpauthUrl: string; secret: string }> {
    console.log('request.user', request.user);
    return this.twofaService.generateQrCodeDataURL(
      request.user.email,
      request.user.twoFactorAuthenticationSecret,
    );
  }
  @Post('/turn-off')
  @UseGuards(AuthGuard('jwt'))
  async turnOffTwoFactorAuthentication(@Req() request, @Body() body) {
    const isCodeValid = this.twofaService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user,
    );
    if (!isCodeValid) {
      // throw new UnauthorizedException('Wrong authentication code');
      throw new HttpException(
        'Wrong authentication code',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.twofaService.disableTwoFactorAuthenticationSecret(
      request.user,
    );
  }
}
