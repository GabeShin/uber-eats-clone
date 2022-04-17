import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { SendEmailInput, SendEmailOutput } from './dto/send-email.dto';
import {
  SendVerificationEmailInput,
  SendVerificationEmailOutput,
} from './dto/send-verification-email.dto';
import { MailModuleOptions } from './mail.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    sendEmailInput: SendEmailInput,
  ): Promise<SendEmailOutput> {
    return { ok: false };
  }

  async sendVerificationEmail(
    sendVerificationEmailInput: SendVerificationEmailInput,
  ): Promise<SendVerificationEmailOutput> {
    return this.sendEmail({
      subject: sendVerificationEmailInput.subject,
      template: sendVerificationEmailInput.template,
      emailVars: [{ key: 'code', value: sendVerificationEmailInput.code }],
    });
  }
}
