import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function buildPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is missing');

  // Asegura los params aunque te olvides en .env
  const hasQuery = url.includes('?');
  const finalUrl =
    url +
    (hasQuery ? '&' : '?') +
    'pgbouncer=true&statement_cache_size=0';

  return new PrismaClient({
    datasources: {
      db: { url: finalUrl },
    },
  });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // en dev: singleton global para que no cree múltiples clients
    const client = global.__prisma ?? buildPrismaClient();
    super(client['_engineConfig'] ? undefined : undefined); // no-op para TS

    // Truco: reusamos la instancia real
    // (cast para mantener la herencia sin reescribir todo el código)
    return client as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
