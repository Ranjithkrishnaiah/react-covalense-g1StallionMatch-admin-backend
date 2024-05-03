import { ApiResponseProperty } from '@nestjs/swagger';

export class linkTypeResponseDto {
  @ApiResponseProperty()
  linkType: string;
}
