import { app } from './app';
import { config } from './config';
import { prisma } from './prisma';

const server = app.listen(config.port, () =>
  console.log(`MiniLedger API on http://localhost:${config.port}`),
);

const shutdown = () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
