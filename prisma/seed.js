/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('Admin12345', 10);

  // branches
  const b1 = await prisma.branch.upsert({
    where: { name: 'Филиал Тирасполь' },
    update: {},
    create: { name: 'Филиал Тирасполь', city: 'Тирасполь' },
  });
  const b2 = await prisma.branch.upsert({
    where: { name: 'Филиал Бендеры' },
    update: {},
    create: { name: 'Филиал Бендеры', city: 'Бендеры' },
  });
  const b3 = await prisma.branch.upsert({
    where: { name: 'Филиал Дубоссары' },
    update: {},
    create: { name: 'Филиал Дубоссары', city: 'Дубоссары' },
  });

  // director
  await prisma.user.upsert({
    where: { email: 'director@local.dev' },
    update: {},
    create: {
      email: 'director@local.dev',
      passwordHash: pass,
      role: 'DIRECTOR',
      fullName: 'Директор',
    },
  });

  // admins for each branch
  await prisma.user.upsert({
    where: { email: 'tiraspol@local.dev' },
    update: {},
    create: {
      email: 'tiraspol@local.dev',
      passwordHash: pass,
      role: 'ADMIN',
      branchId: b1.id,
      fullName: 'Админ Тирасполь',
    },
  });

  await prisma.user.upsert({
    where: { email: 'benderi@local.dev' },
    update: {},
    create: {
      email: 'benderi@local.dev',
      passwordHash: pass,
      role: 'ADMIN',
      branchId: b2.id,
      fullName: 'Админ Бендеры',
    },
  });

  await prisma.user.upsert({
    where: { email: 'dubossary@local.dev' },
    update: {},
    create: {
      email: 'dubossary@local.dev',
      passwordHash: pass,
      role: 'ADMIN',
      branchId: b3.id,
      fullName: 'Админ Дубоссары',
    },
  });

  console.log('Seed done ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
