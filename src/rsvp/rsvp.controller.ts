import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { RsvpService } from './rsvp.service';

@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Post()
  create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  // Opcional (para admin/organizador)
  @Get()
  list() {
    return this.rsvpService.list();
  }
}
