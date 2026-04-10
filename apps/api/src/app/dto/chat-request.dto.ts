import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({
    description: 'The message from the user',
    example: 'Hello, what is the status of my order?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
