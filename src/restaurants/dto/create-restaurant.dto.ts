import { InputType, OmitType } from '@nestjs/graphql';
import { RestaurantEntity as Entity } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(Entity, ['id']) {}
