import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GiftsModule } from './gifts/gifts.module';
import { RsvpModule } from './rsvp/rsvp.module';

@Module({
  imports: [PrismaModule, GiftsModule, RsvpModule],
})
export class AppModule {}
