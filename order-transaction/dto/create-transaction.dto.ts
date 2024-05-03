import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  paymentStatus?: number | null;
  status?: string | null;
  paymentIntent?: string | null;
  couponId?: number | null;
  orderId?: number | null;
  paymentMethod?: number | null;
  createdBy?: number | null;
  memberId?: number | null;
  mode?: string | null;
}
