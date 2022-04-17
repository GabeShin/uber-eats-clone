import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  SendVerificationEmailInput,
  SendVerificationEmailOutput,
} from './dto/send-verification-email.dto';
import { MailService } from './mail.service';

@Resolver()
export class MailResolver {
  constructor(private readonly mailService: MailService) {}

  @Query(() => SendVerificationEmailOutput)
  sendVerificationEmail(
    @Args('input') input: SendVerificationEmailInput,
  ): Promise<SendVerificationEmailOutput> {
    return this.mailService.sendVerificationEmail(input);
  }
}
