import { ApiResponseProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  subject: string;
}
