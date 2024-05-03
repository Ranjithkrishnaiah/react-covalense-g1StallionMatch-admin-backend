import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'acss_debit' })
  @IsString()
  paymentMethodType: string;

  @ApiProperty({ example: 'cad' })
  @IsString()
  currency: string;

  @ApiProperty()
  paymentMethodOptions: any;
}
