import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RestaurantEntity {
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isVegan: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}