import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class HorsePageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: { name: 'Horse', value: 'horseName' } })
  @IsOptional()
  defaultDisplay: object;

  @ApiProperty({ example: { name: 5, value: 5 } })
  @IsOptional()
  generation: object;

  @ApiProperty({
    example: [
      { name: 'Internal', value: 'Internal' },
      { name: 'DB', value: 'db' },
    ],
  })
  @IsOptional()
  source: Array<string>;

  @ApiProperty({ 
    example: { 
      options:[ 
        {name: "Verified", value: "Verified", isSelected: 1 },
        {name: "UnVerified", value: "Un verified", isSelected: 1}
      ]
    }
  })
  @IsOptional()
  verifyStatus: object;

  @ApiProperty()
  @IsOptional()
  breed: Array<string>;

  @ApiProperty()
  @IsOptional()
  startDate: string;
}
