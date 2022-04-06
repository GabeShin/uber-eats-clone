import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity as Entity } from './entities/restaurant.entity';
import { RestaurantResolver as Resolver } from './restaurants.resolver';
import { RestuarantService as Service } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  providers: [Resolver, Service],
})
export class RestaurantsModule {}
