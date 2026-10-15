import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ example: 'Turborepo docs' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'https://turborepo.dev/docs' })
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'Monorepo build system' })
  @IsString()
  description!: string;
}
