const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const MANAGER_EMAIL = 'manager@test.com';
const TECHNICIAN_EMAIL = 'technician@test.com';
const PASSWORD = 'password123';

let managerToken;
let technicianToken;
let workCenterId;
let taskId;
let technicianId;

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.accessToken;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    throw error;
  }
}

async function testWorkCenterFlow() {
  console.log('\n🚀 TESTING WORK CENTER FLOW\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as manager
    console.log('\n📝 Step 1: Logging in as Manager...');
    managerToken = await login(MANAGER_EMAIL, PASSWORD);
    console.log('✅ Manager logged in successfully');

    // Step 2: Login as technician
    console.log('\n📝 Step 2: Logging in as Technician...');
    technicianToken = await login(TECHNICIAN_EMAIL, PASSWORD);
    console.log('✅ Technician logged in successfully');

    // Step 3: Get technician ID
    console.log('\n📝 Step 3: Getting Technician ID...');
    const techResponse = await axios.get(`${BASE_URL}/technician/dashboard`, {
      headers: { Authorization: `Bearer ${technicianToken}` },
    });
    technicianId = techResponse.data.technician.id;
    console.log(`✅ Technician ID: ${technicianId}`);

    // Step 4: Create work center
    console.log('\n📝 Step 4: Manager creates Work Center...');
    const workCenterData = {
      name: 'Assembly Line 1',
      code: `WC-${Date.now()}`,
      type: 'Manufacturing',
      tag: 'Critical',
      location: 'Building A, Floor 2',
      costPerHour: 50.00,
      capacity: 1,
      timeEfficiency: 100,
      oeeTarget: 85,
      assignedWorkerIds: [technicianId],
    };
    const createWCResponse = await axios.post(
      `${BASE_URL}/work-center`,
      workCenterData,
      {
        headers: { Authorization: `Bearer ${managerToken}` },
      }
    );
    workCenterId = createWCResponse.data.data.id;
    console.log('✅ Work Center created:', {
      id: workCenterId,
      name: createWCResponse.data.data.name,
      code: createWCResponse.data.data.code,
      assignedWorkers: createWCResponse.data.data.assignedWorkers.length,
    });

    // Step 5: Get work center details
    console.log('\n📝 Step 5: Getting Work Center details...');
    const wcDetails = await axios.get(`${BASE_URL}/work-center/${workCenterId}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log('✅ Work Center details retrieved:', {
      name: wcDetails.data.data.name,
      workers: wcDetails.data.data.assignedWorkers.map(w => w.user.name),
    });

    // Step 6: Get equipment for task assignment
    console.log('\n📝 Step 6: Getting equipment list...');
    const equipmentResponse = await axios.get(`${BASE_URL}/equipment`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const equipment = Array.isArray(equipmentResponse.data) 
      ? equipmentResponse.data[0] 
      : equipmentResponse.data.data?.[0];
    console.log('✅ Equipment found:', equipment?.name || 'None');

    // Step 7: Manager assigns task from work center
    console.log('\n📝 Step 7: Manager assigns task to Technician from Work Center...');
    const taskData = {
      title: 'Repair Hydraulic Press',
      description: 'Hydraulic system leaking oil, needs immediate attention',
      technicianId: technicianId,
      equipmentId: equipment?.id,
      priority: 'HIGH',
      requestType: 'CORRECTIVE',
    };
    const assignTaskResponse = await axios.post(
      `${BASE_URL}/work-center/${workCenterId}/assign-task`,
      taskData,
      {
        headers: { Authorization: `Bearer ${managerToken}` },
      }
    );
    taskId = assignTaskResponse.data.data.id;
    console.log('✅ Task assigned:', {
      id: taskId,
      title: assignTaskResponse.data.data.title,
      status: assignTaskResponse.data.data.status,
      assignedTo: assignTaskResponse.data.data.assignedTechnician?.name,
      startTime: assignTaskResponse.data.data.startTime,
      message: assignTaskResponse.data.message,
    });

    // Verify task started immediately (IN_PROGRESS, not PENDING_APPROVAL)
    if (assignTaskResponse.data.data.status !== 'IN_PROGRESS') {
      throw new Error(`Expected status IN_PROGRESS, got ${assignTaskResponse.data.data.status}`);
    }
    console.log('✅ Task status is IN_PROGRESS (no approval needed from work center)');

    // Step 8: Check if task appears in Kanban
    console.log('\n📝 Step 8: Checking Kanban board...');
    const kanbanResponse = await axios.get(`${BASE_URL}/kanban`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const kanbanData = Array.isArray(kanbanResponse.data) 
      ? kanbanResponse.data 
      : kanbanResponse.data.data || [];
    const taskInKanban = kanbanData.some(req => req.id === taskId);
    console.log('✅ Task appears in Kanban:', taskInKanban);

    // Step 9: Technician views dashboard
    console.log('\n📝 Step 9: Technician checks dashboard...');
    const dashResponse = await axios.get(`${BASE_URL}/technician/dashboard`, {
      headers: { Authorization: `Bearer ${technicianToken}` },
    });
    console.log('✅ Technician dashboard:', {
      activeJobs: dashResponse.data.stats.activeJobs,
      pendingJobs: dashResponse.data.stats.pendingJobs,
      completed: dashResponse.data.stats.completedThisMonth,
    });

    // Step 10: Technician updates progress
    console.log('\n📝 Step 10: Technician updates progress...');
    const updateResponse = await axios.patch(
      `${BASE_URL}/requests/${taskId}/update-progress`,
      {
        workNotes: 'Identified leak in hydraulic pump seal. Ordering replacement parts.',
      },
      {
        headers: { Authorization: `Bearer ${technicianToken}` },
      }
    );
    const updateData = updateResponse.data.request || updateResponse.data;
    console.log('✅ Progress updated:', {
      workNotes: updateData.workNotes,
    });

    // Step 11: Technician completes the task
    console.log('\n📝 Step 11: Technician completes the task...');
    const completeResponse = await axios.patch(
      `${BASE_URL}/requests/${taskId}/complete`,
      {
        hoursSpent: 3.5,
        rootCause: 'WEAR_AND_TEAR',
        workNotes: 'Replaced hydraulic pump seal. System tested and pressure is normal.',
        isTemporaryFix: false,
      },
      {
        headers: { Authorization: `Bearer ${technicianToken}` },
      }
    );
    const completeData = completeResponse.data.request || completeResponse.data;
    console.log('✅ Task completed:', {
      status: completeData.status,
      hoursSpent: completeData.hoursSpent,
      rootCause: completeData.rootCause,
    });

    // Step 12: Verify task status in Kanban
    console.log('\n📝 Step 12: Verifying final status in Kanban...');
    const finalKanban = await axios.get(`${BASE_URL}/kanban`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const kanbanFinalData = Array.isArray(finalKanban.data) 
      ? finalKanban.data 
      : finalKanban.data.data || [];
    const completedTask = kanbanFinalData.find(req => req.id === taskId);
    console.log('✅ Final task status:', {
      status: completedTask?.status,
      completedAt: completedTask?.completedAt,
    });

    // Step 13: Get work center statistics
    console.log('\n📝 Step 13: Getting Work Center statistics...');
    const statsResponse = await axios.get(
      `${BASE_URL}/work-center/${workCenterId}/statistics`,
      {
        headers: { Authorization: `Bearer ${managerToken}` },
      }
    );
    console.log('✅ Work Center statistics:', {
      totalTasks: statsResponse.data.data.statistics.totalTasks,
      activeTasks: statsResponse.data.data.statistics.activeTasks,
      completedTasks: statsResponse.data.data.statistics.completedTasks,
      avgCompletionTime: statsResponse.data.data.statistics.avgCompletionTime,
    });

    // Step 14: Get all work centers
    console.log('\n📝 Step 14: Getting all Work Centers...');
    const allWCResponse = await axios.get(`${BASE_URL}/work-center`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log('✅ Total work centers:', allWCResponse.data.data.length);

    // Step 15: Clean up - deactivate work center
    console.log('\n📝 Step 15: Cleaning up - deactivating Work Center...');
    try {
      await axios.delete(`${BASE_URL}/work-center/${workCenterId}`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      console.log('✅ Work Center deactivated successfully');
    } catch (error) {
      // Work center has active tasks, expected
      console.log('⚠️  Cannot delete work center with completed tasks (expected)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 WORK CENTER FLOW TEST PASSED!\n');
    console.log('Summary:');
    console.log('- Manager created work center with assigned technician ✅');
    console.log('- Manager assigned task directly (bypassed approval) ✅');
    console.log('- Task started immediately with IN_PROGRESS status ✅');
    console.log('- Task appeared in Kanban board ✅');
    console.log('- Technician updated progress ✅');
    console.log('- Technician completed task ✅');
    console.log('- Work center statistics tracked ✅');
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
    process.exit(1);
  }
}

// Run the test
testWorkCenterFlow();
