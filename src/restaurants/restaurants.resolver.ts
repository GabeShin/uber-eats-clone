import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { number } from 'joi';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantEntity as Restaurant } from './entities/restaurant.entity';
import { RestuarantService as Service } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly service: Service) {}

  @Query(() => Restaurant)
  restaurants(): Promise<Restaurant[]> {
    return this.service.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('input') createDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.service.createRestaurant(createDto);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args('input') updateDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.service.updateRestaurant(updateDto);
      return true;
    } catch (error) {
      throw new Error('');
    }
  }
}
