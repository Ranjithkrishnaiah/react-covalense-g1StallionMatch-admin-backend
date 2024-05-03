import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteFarmDto } from './create-favourite-farm.dto';

export class UpdateFavouriteFarmDto extends PartialType(
  CreateFavouriteFarmDto,
) {}
