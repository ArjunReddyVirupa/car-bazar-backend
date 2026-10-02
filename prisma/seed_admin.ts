import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe_12345!';
  const name = process.env.ADMIN_NAME ?? 'Business Admin';

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, isActive: true },
    create: { email, name, passwordHash, role: 'ADMIN' }
  });

  console.log(`Admin seeded: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
