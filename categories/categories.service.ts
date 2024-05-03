import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /* Get All Categories */
  findAll() {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .select('category.id ,category.categoryName');
    const categories = queryBuilder.getRawMany();
    return categories;
  }

  /* Get a Category */
  findOne(id: number) {
    return this.categoryRepository.find({
      id,
    });
  }
}
