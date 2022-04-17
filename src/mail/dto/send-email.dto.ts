import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { EmailVar } from '../mail.interface';

@InputType()
export class SendEmailInput {
  @Field(() => String)
  subject: string;

  @Field(() => String)
  template: string;

  @Field(() => String)
  emailVars: EmailVar[];
}

@ObjectType()
export class SendEmailOutput extends CoreOutput {}
