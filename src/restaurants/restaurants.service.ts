import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantEntity as Entity } from './entities/restaurant.entity';

@Injectable()
export class RestuarantService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
  ) {}

  getAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  createRestaurant(createDto: CreateRestaurantDto): Promise<Entity> {
    const newRestaurant = this.repository.create(createDto);
    return this.repository.save(newRestaurant);
  }

  updateRestaurant(updateDto: UpdateRestaurantDto) {
    return this.repository.update(updateDto.id, { ...updateDto.data });
  }
}
