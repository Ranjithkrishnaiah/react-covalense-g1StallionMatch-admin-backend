import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteBroodmareSireDto } from './create-favourite-broodmare-sire.dto';

export class UpdateFavouriteBroodmareSireDto extends PartialType(
  CreateFavouriteBroodmareSireDto,
) {}
