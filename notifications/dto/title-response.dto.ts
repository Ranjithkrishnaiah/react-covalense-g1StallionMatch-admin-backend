import { ApiResponseProperty } from '@nestjs/swagger';

export class TitleResponseDto {
  @ApiResponseProperty()
  title: string;
}
