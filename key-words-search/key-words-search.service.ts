import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { KeyWordsSearchOptionsDto } from './dto/key-words-search-options.dto';

@Injectable()
export class KeyWordsSearchService {
  constructor(private readonly connection: Connection) {}

  //Get all records
  async findAll(searchOptionsDto: KeyWordsSearchOptionsDto) {
    const record = await this.connection.query(
      `EXEC proc_SMPSearch @psearchchars=@0`,
      [searchOptionsDto.keyWord],
    );
    return record;
  }
}
