import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { ImportAssetService } from './import-asset.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Bulk Import')
@Controller({
  path: 'bulk-import',
  version: '1',
})
export class ImportAssetController {
  constructor(private readonly importAssetService: ImportAssetService) {}
  @Get()
  async doMigration() {
    return await this.importAssetService.doMigration();
  }
}
