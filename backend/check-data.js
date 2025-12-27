const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking Database...\n');

  // Check users
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['employee@test.com', 'technician@test.com', 'manager@test.com']
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      teamId: true
    }
  });

  console.log('📋 Users:');
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.role})`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Team ID: ${user.teamId || 'Not assigned'}`);
    console.log(`    User ID: ${user.id}\n`);
  });

  // Check teams
  const teams = await prisma.maintenanceTeam.findMany({
    select: {
      id: true,
      name: true,
      description: true
    }
  });

  console.log('🏢 Teams:');
  teams.forEach(team => {
    console.log(`  - ${team.name}`);
    console.log(`    ID: ${team.id}`);
    console.log(`    Description: ${team.description}\n`);
  });

  // Check equipment
  const equipment = await prisma.equipment.findMany({
    select: {
      id: true,
      name: true,
      primaryTeamId: true
    }
  });

  console.log('⚙️  Equipment:');
  equipment.forEach(eq => {
    console.log(`  - ${eq.name}`);
    console.log(`    ID: ${eq.id}`);
    console.log(`    Primary Team: ${eq.primaryTeamId}\n`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
