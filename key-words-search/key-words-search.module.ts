import { Module } from '@nestjs/common';
import { KeyWordsSearchService } from './key-words-search.service';
import { KeyWordsSearchController } from './key-words-search.controller';

@Module({
  controllers: [KeyWordsSearchController],
  providers: [KeyWordsSearchService],
})
export class KeyWordsSearchModule {}
