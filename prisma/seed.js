import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Clear old data ---
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.room.deleteMany();

  // --- Create Teams ---
  const team1 = await prisma.team.create({ data: { name: 'Alpha Team' } });
  const team2 = await prisma.team.create({ data: { name: 'Beta Team' } });

  console.log('✅ Teams created:', team1.name, team2.name);

  // --- Create 20 Users ---
  const usersData = [];
  for (let i = 1; i <= 20; i++) {
    usersData.push({
      name: `User ${i}`,
      age: 20 + (i % 10),
      gender: i % 2 === 0 ? 'F' : 'M',
      teamId: i <= 10 ? team1.id : team2.id, // first 10 users → team1, next 10 → team2
    });
  }

  const users = await prisma.user.createMany({ data: usersData });
  console.log(`✅ 20 users created`);

  // --- Create Rooms ---
  const rooms = [
    ...Array(8).fill({ type: 'PRIVATE', capacity: 1 }),
    ...Array(4).fill({ type: 'CONFERENCE', capacity: 10 }),
    ...Array(3).fill({ type: 'SHARED', capacity: 4 }),
  ];

  await prisma.room.createMany({ data: rooms });
  console.log(`✅ ${rooms.length} rooms created`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
