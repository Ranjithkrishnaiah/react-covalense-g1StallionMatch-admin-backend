import { PartialType } from '@nestjs/swagger';
import { CreateFavouriteMareDto } from './create-favourite-mare.dto';

export class UpdateFavouriteMareDto extends PartialType(
  CreateFavouriteMareDto,
) {}
