import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GiftsService {
  constructor(private prisma: PrismaService) {}

  private buildPublicImageUrl(imagePath: string | null) {
    if (!imagePath) return null;

    // Define en tu .env:
    // SUPABASE_URL="https://xxxx.supabase.co"
    // SUPABASE_STORAGE_BUCKET="gifts"
    const baseUrl = process.env.SUPABASE_URL;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'gifts';

    // Si por alguna razón ya guardas URL completa, la devolvemos tal cual
    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    if (!baseUrl) return null;

    // URL pública estándar de Supabase Storage
    return `${baseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;
  }

  async listGifts() {
    const gifts = await this.prisma.gift.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        reservations: {
          where: { cancelledAt: null },
          orderBy: { reservedAt: 'desc' },
          take: 1,
        },
      },
    });

    return gifts.map((g) => {
      const activeRes = g.reservations[0];

      const imagePublicUrl = this.buildPublicImageUrl(
        // si tu modelo ahora se llama imagePath:
        (g as any).imagePath ?? null
      );

      return {
        id: g.id,

        // Campos del regalo
        title: g.title,
        description: (g as any).description ?? null,
        category: (g as any).category ?? null,

        // NUEVOS CAMPOS (lo que editamos)
        buyUrl: (g as any).buyUrl ?? null,
        imagePath: (g as any).imagePath ?? null,

        // Extra útil para el front
        imagePublicUrl,

        // Estado de reserva
        status: activeRes ? 'RESERVED' : 'AVAILABLE',
        reservedByName: activeRes?.reservedByName ?? null,
        reservedAt: activeRes?.reservedAt ?? null,

        // Extras útiles para UI (opcional)
        sortOrder: (g as any).sortOrder ?? 0,
      };
    });
  }

  async reserveGift(giftId: string, reservedByName: string) {
    const gift = await this.prisma.gift.findFirst({
      where: { id: giftId, isActive: true },
      select: { id: true },
    });
    if (!gift) throw new NotFoundException('Gift not found');

    try {
      const reservation = await this.prisma.giftReservation.create({
        data: {
          giftId,
          reservedByName: reservedByName.trim(),
        },
      });

      return { ok: true, reservationId: reservation.id };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Este regalo ya fue reservado');
      }
      throw e;
    }
  }

  async cancelReservation(giftId: string) {
    const active = await this.prisma.giftReservation.findFirst({
      where: { giftId, cancelledAt: null },
      orderBy: { reservedAt: 'desc' },
    });

    if (!active) return { ok: true, message: 'No active reservation' };

    await this.prisma.giftReservation.update({
      where: { id: active.id },
      data: { cancelledAt: new Date() },
    });

    return { ok: true };
  }
}
