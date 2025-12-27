const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTeamAssignments() {
  console.log('🔧 Fixing team assignments...\n');

  // Get the equipment team
  const equipment = await prisma.equipment.findFirst({
    where: {
      name: 'Industrial Lathe Machine'
    }
  });

  if (!equipment) {
    console.error('❌ Equipment not found');
    return;
  }

  const correctTeamId = equipment.primaryTeamId;
  console.log(`✅ Equipment team ID: ${correctTeamId}\n`);

  // Update technician's team
  const technician = await prisma.user.update({
    where: {
      email: 'technician@test.com'
    },
    data: {
      teamId: correctTeamId
    }
  });

  console.log(`✅ Updated technician team to: ${technician.teamId}\n`);

  // Verify
  console.log('📋 Verification:');
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['technician@test.com']
      }
    },
    select: {
      name: true,
      email: true,
      teamId: true
    }
  });

  users.forEach(user => {
    console.log(`  ${user.name}: Team ${user.teamId}`);
  });

  console.log(`  Equipment: Team ${equipment.primaryTeamId}`);
  console.log(`  Match: ${users[0].teamId === equipment.primaryTeamId ? '✅ YES' : '❌ NO'}\n`);

  await prisma.$disconnect();
}

fixTeamAssignments().catch(console.error);
