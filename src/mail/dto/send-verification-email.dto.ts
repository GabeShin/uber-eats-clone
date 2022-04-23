import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { SendEmailOutput } from './send-email.dto';

@InputType()
export class SendVerificationEmailInput {
  @Field(() => String)
  recipient: string;

  @Field(() => String)
  code: string;
}

@ObjectType()
export class SendVerificationEmailOutput extends SendEmailOutput {}
