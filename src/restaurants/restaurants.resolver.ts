import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantEntity as Restaurant } from './entities/restaurant.entity';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  @Query(() => Restaurant)
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    if (veganOnly) {
      return [];
    }
    return [];
  }

  @Mutation(() => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    console.log(createRestaurantDto);
    return true;
  }
}
