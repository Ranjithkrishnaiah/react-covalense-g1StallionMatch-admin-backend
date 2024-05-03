import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository, getRepository } from 'typeorm';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { Pricing } from './entities/pricing.entity';
import { NomPricing } from 'src/nomination-pricing/entities/nomination-pricing.entity';
import { PRODUCT } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class PricingService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Pricing)
    private priceRepository: Repository<Pricing>,
  //  private nomPriceRepository: Repository<NomPricing>,
  ) { }
  /* Get All Prices for Products */
  async find(id: number) {
    const queryBuilder = this.priceRepository
      .createQueryBuilder('pricing')
      .select(
        'pricing.id as id, pricing.currencyId, pricing.price,pricing.isActive as isActive,pricing.createdOn',
      )
      .addSelect(
        'currency.currencyName, currency.currencyCode,currency.currencySymbol',
      )
      queryBuilder
      .leftJoin('pricing.currency', 'currency')
      .andWhere('pricing.productId = :productId', { productId: id });
      const entities = await queryBuilder.getRawMany();
      if(id == PRODUCT.NOMINATION_ACCEPTANCE){
        const nomPrices = await getRepository(NomPricing)
        .createQueryBuilder('nompricing')
        .select(
          'nompricing.id as id, nompricing.currencyId, nompricing.tier1,nompricing.tier2,nompricing.tier3,nompricing.isActive as isActive,nompricing.createdOn,nompricing.studFeeRange',
        )
        .addSelect(
          'currency.currencyName, currency.currencyCode,currency.currencySymbol',
        )
        .leftJoin('nompricing.currency', 'currency')
        .andWhere('nompricing.productId = :productId', { productId: id })
        .getRawMany();
        return nomPrices;
      }
  
    return entities;
  }
  /* Create Pricing Records for Product */
  async create(data: CreatePricingDto) {
   
    if(data.productId == PRODUCT.NOMINATION_ACCEPTANCE){
      delete data.price
      let found =  await getRepository(NomPricing).findOne({
        productId: data.productId,
        currencyId: data.currencyId,
      });
      if (!found) {
        var Nomprice = await getRepository(NomPricing).save(
          getRepository(NomPricing).create(data),
        );
      } 
      else{
        await getRepository(NomPricing).update(found.id, data);
      }
      return Nomprice;
    }
    else{
      delete data.tier1
      delete data.tier2
      delete data.tier3
      delete data.studFeeRange
      let found = await this.priceRepository.findOne({
        productId: data.productId,
        currencyId: data.currencyId,
      });
      if (!found) {
        var price = await this.priceRepository.save(
          this.priceRepository.create(data),
        );
      } 
      else {
        this.priceRepository.update(found.id, data);
      }
      return price;
    }


   
  }
}
