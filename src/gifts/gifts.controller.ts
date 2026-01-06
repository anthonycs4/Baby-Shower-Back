import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReserveGiftDto } from './dto/reserve-gift.dto';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private giftsService: GiftsService) {}

  @Get()
  list() {
    return this.giftsService.listGifts();
  }

  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body() dto: ReserveGiftDto) {
    return this.giftsService.reserveGift(id, dto.reservedByName);
  }

  // opcional
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.giftsService.cancelReservation(id);
  }
}
