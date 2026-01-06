import { IsNotEmpty } from 'class-validator';

export class ReserveGiftDto {
  @IsNotEmpty()
  reservedByName: string;
}
