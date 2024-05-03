import { EntityRepository, Repository } from 'typeorm';
import { StallionRetiredReasons } from '../entity/stallion-retired-reasons.entity';

@EntityRepository(StallionRetiredReasons)
export class StallionRetiredReasonsRepository extends Repository<StallionRetiredReasons> {}
