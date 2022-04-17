import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { SendEmailInput, SendEmailOutput } from './send-email.dto';

@InputType()
export class SendVerificationEmailInput extends SendEmailInput {
  @Field(() => String)
  code: string;
}

@ObjectType()
export class SendVerificationEmailOutput extends SendEmailOutput {}
