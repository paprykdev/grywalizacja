import { ApiProperty } from '@nestjs/swagger';

export class AuthUser {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  status!: string;
}
