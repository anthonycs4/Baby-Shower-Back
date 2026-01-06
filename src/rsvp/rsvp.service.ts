import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRsvpDto) {
    return this.prisma.rsvp.create({
      data: {
        fullName: dto.fullName.trim(),
        companionsCount: dto.companionsCount,
      },
    });
  }

  list() {
    return this.prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
