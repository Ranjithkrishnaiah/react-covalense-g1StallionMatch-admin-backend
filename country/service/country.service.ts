import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, getManager, getRepository } from 'typeorm';
import { Country } from '../entity/country.entity';
import { CountryPayload } from '../interface/country-payload.interface';
import { CountryRepository } from '../repository/country.repository';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryRepository)
    private countryRepository: CountryRepository,
  ) {}

  /* Get all countries */
  async getAllCountries(): Promise<CountryPayload[]> {
    const entities: any = await this.countryRepository.find({
      where: [{ isDisplay: true }],
      order: {
        countryName: 'ASC',
      },
    });

    return entities;
  }

  /* Get all countries with states */
  async getAllCountriesWithStates() {
    const q = getManager()
      .createQueryBuilder()
      .addSelect('c.id, c.countryName, c.countryCode')
      .addSelect('s.id AS stateId, s.stateName')
      .from('Country', 'c')
      .leftJoin('State', 's', 'c.id = s.countryId')
      .andWhere('c.isDisplay = :isDisplay', {
        isDisplay: true,
      })
      .addOrderBy('c.countryName', 'ASC');
    const dbList = await q.getRawMany();
    const countryStatesList = [];
    dbList.map((s: any) => {
      if (!countryStatesList[s.id]) {
        countryStatesList[s.id] = {
          countryId: s.id,
          countryName: s.countryName,
          countryCode: s.countryCode,
          states: [],
        };
      }
      if (s.stateId) {
        let state = {
          countryId: s.id,
          stateId: s.stateId,
          stateName: s.stateName,
        };
        countryStatesList[s.id].states.push(state);
      }
    });
    let finalList = countryStatesList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  /* Get country by Id */
  async getCountryById(id: number) {
    const record = await this.countryRepository.findOne({ id });
    if (!record) {
      throw new UnprocessableEntityException('country not exist!');
    }
    return record;
  }

  /* UnBlackList Countries For AdminPortal */
  async unBlackListCountriesForAdminPortal() {
    await this.countryRepository
      .createQueryBuilder()
      .update(Country)
      .set({ blackListFromAdminPortal: false })
      .execute();
  }

  /* BlackList Countries For AdminPortal */
  async blackListCountriesForAdminPortal(countries = []) {
    if (countries.length === 0) {
      return;
    }
    await this.unBlackListCountriesForAdminPortal();
    await this.countryRepository
      .createQueryBuilder()
      .update(Country)
      .set({ blackListFromAdminPortal: true })
      .where('id IN (:...countries)', { countries: countries })
      .execute();
  }

  /* Get All Eligible Race Countries List */
  async getEligibleRaceCountries() {
    const qb = getRepository(Country)
      .createQueryBuilder('country')
      .select(['id', 'countryName'])
      .where('country.isDisplay = :isDisplay', { isDisplay: true })
      .andWhere('country.isEligibleRaceCountry = :isEligibleRaceCountry', {
        isEligibleRaceCountry: true,
      })
      .andWhere('country.id > :id', { id: 1 })
      .orderBy('country.countryName', 'ASC')
      const entities = await qb.getRawMany()
    return entities;
  }
}
