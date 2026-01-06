import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRsvpDto {
  @IsNotEmpty()
  fullName: string;

  @IsInt()
  @Min(0)
  companionsCount: number;
}
