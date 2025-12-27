const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...\n');

    // 1. Register Manager
    console.log('1️⃣  Creating Manager account...');
    try {
      const manager = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'MANAGER'
      });
      console.log('   ✅ Manager created:', manager.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Manager already exists');
      } else {
        console.error('   ❌ Error:', error.response?.data || error.message);
      }
    }

    // Login as manager to get token
    const managerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@test.com',
      password: 'password123'
    });
    const managerToken = managerLogin.data.accessToken;
    console.log('   🔑 Manager logged in\n');

    // 2. Create Team
    console.log('2️⃣  Creating Maintenance Team...');
    let teamId;
    try {
      const team = await axios.post(`${API_URL}/teams`, {
        name: 'Mechanical Team',
        description: 'Handles mechanical equipment maintenance'
      }, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      teamId = team.data.team.id;
      console.log('   ✅ Team created:', team.data.team.name, `(ID: ${teamId})`);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 500) {
        // Team might exist, get it
        const teams = await axios.get(`${API_URL}/teams`, {
          headers: { Authorization: `Bearer ${managerToken}` }
        });
        teamId = teams.data[0]?.id;
        console.log('   ℹ️  Using existing team (ID:', teamId, ')');
      } else {
        console.error('   ❌ Error:', error.response?.data || error.message);
        return;
      }
    }

    if (!teamId) {
      console.error('❌ Could not create or find team');
      return;
    }

    // 3. Register Technician
    console.log('\n3️⃣  Creating Technician account...');
    try {
      const technician = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Technician',
        email: 'technician@test.com',
        password: 'password123',
        role: 'TECHNICIAN',
        teamId: teamId
      });
      console.log('   ✅ Technician created:', technician.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Technician already exists');
      } else {
        console.error('   ❌ Error:', error.response?.data || error.message);
      }
    }

    // 4. Register Employee
    console.log('\n4️⃣  Creating Employee account...');
    try {
      const employee = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Employee',
        email: 'employee@test.com',
        password: 'password123',
        role: 'EMPLOYEE'
      });
      console.log('   ✅ Employee created:', employee.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Employee already exists');
      } else {
        console.error('   ❌ Error:', error.response?.data || error.message);
      }
    }

    // 5. Create Equipment
    console.log('\n5️⃣  Creating Test Equipment...');
    try {
      const equipment = await axios.post(`${API_URL}/equipment`, {
        name: 'Industrial Lathe Machine',
        serialNumber: 'LATHE-001-TEST',
        type: 'Machinery',
        manufacturer: 'TechMach Industries',
        model: 'TM-500',
        location: 'Factory Floor A',
        department: 'Production',
        primaryTeamId: teamId,
        purchaseDate: '2023-01-15T00:00:00.000Z',
        warrantyEnd: '2026-01-15T00:00:00.000Z'
      }, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      console.log('   ✅ Equipment created:', equipment.data.equipment?.name || equipment.data.name, `(ID: ${equipment.data.equipment?.id || equipment.data.id})`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Equipment already exists');
      } else {
        console.error('   ❌ Error:', error.response?.data || error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST DATA SETUP COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📋 Test Accounts Created:');
    console.log('   👔 Manager:    manager@test.com / password123');
    console.log('   🔧 Technician: technician@test.com / password123');
    console.log('   👤 Employee:   employee@test.com / password123');
    console.log('\n🏢 Team: Mechanical Team (ID:', teamId, ')');
    console.log('⚙️  Equipment: Industrial Lathe Machine');
    console.log('\n▶️  You can now run: node test-workflow.js\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

setupTestData();
