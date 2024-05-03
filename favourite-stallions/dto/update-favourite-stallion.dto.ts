import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteStallionDto } from './create-favourite-stallion.dto';

export class UpdateFavouriteStallionDto extends PartialType(
  CreateFavouriteStallionDto,
) {}
