import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserSort } from 'src/utils/constants/user-list-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchUsersDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: UserSort, default: UserSort.ID })
  @IsEnum(UserSort)
  @IsOptional()
  readonly sortBy?: UserSort = UserSort.ID;
}
