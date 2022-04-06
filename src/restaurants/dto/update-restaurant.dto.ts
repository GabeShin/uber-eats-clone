import {
  ArgsType,
  Field,
  InputType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { RestaurantEntity as Entity } from '../entities/restaurant.entity';

@InputType()
export class UpdateRestaurantInputType extends PartialType(
  OmitType(Entity, ['id'] as const),
) {}

@InputType()
export class UpdateRestaurantDto {
  @Field(() => Number)
  id: number;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
