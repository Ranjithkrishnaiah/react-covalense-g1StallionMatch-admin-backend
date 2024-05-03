import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesLotInfoTemp } from './entities/sale-lot-info-temp.entity';

@Injectable()
export class SalesLotInfoTempService {
  constructor(
    @InjectRepository(SalesLotInfoTemp)
    private salesLotInfoTempRepository: Repository<SalesLotInfoTemp>,
  ) {}

  //Get All Imported Data
  async find(id) {
    const entities = await this.salesLotInfoTempRepository
      .createQueryBuilder('salesTemp')
      .select(
        'salesTemp.id,salesTemp.horseName,salesTemp.horseYob as dob,salesTemp.horseCob as Cob,salesTemp.horseColour',
      )
      .addSelect(
        'salesTemp.sireName,salesTemp.sireYob,salesTemp.sireCob,salesTemp.sireSireName as grandSire',
      )
      .addSelect(
        'salesTemp.damName,salesTemp.damYob,salesTemp.damCob,salesTemp.damSireName as damSire',
      )
      .addSelect('lotTypes.salesTypeName as lotType')
      .addSelect(
        'salesLot.horseGender as sex,salesLot.venderName,salesLot.buyerName as buyer,salesLot.buyerLocation as buyerLocation,salesLot.price',
      )
      .addSelect('sales.modifiedOn as salesLastUpdated, member.email as lastUpdatedBy')
      .innerJoin('salesTemp.salesLot', 'salesLot')
       .innerJoin('salesLot.sales', 'sales')
      // .innerJoin('salesLot.salestype', 'salestype')
     // .leftJoin('salesTemp.salesLot','salesLot')
      .leftJoin('salesLot.lotTypes','lotTypes')
      .leftJoin('sales.member','member','member.id = sales.modifiedby')
      .andWhere('salesTemp.salesLotInfoUuid =:id', { id: id })
      .getRawOne();
    return entities;
  }
}
