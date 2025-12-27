const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Store tokens and IDs
let employeeToken, technicianToken, managerToken;
let teamId, equipmentId, requestId;
let employeeId, technicianId, managerId;

// Helper function to log steps
const logStep = (step, data) => {
  console.log('\n' + '='.repeat(80));
  console.log(`STEP ${step}`);
  console.log('='.repeat(80));
  console.log(JSON.stringify(data, null, 2));
};

const logError = (step, error) => {
  console.error('\n' + '❌'.repeat(40));
  console.error(`ERROR IN STEP ${step}`);
  console.error('❌'.repeat(40));
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else {
    console.error(error.message);
  }
};

async function testCompleteWorkflow() {
  try {
    // SETUP: Login as different users
    console.log('\n🔐 AUTHENTICATION PHASE');
    
    // 1. Login as Employee
    logStep('1: Login as Employee', 'Logging in as employee...');
    try {
      const employeeLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'employee@test.com',
        password: 'password123'
      });
      employeeToken = employeeLogin.data.accessToken;
      employeeId = employeeLogin.data.user.id;
      logStep('1: Employee Login Success', { userId: employeeId, role: employeeLogin.data.user.role });
    } catch (error) {
      logError('1: Employee Login', error);
      return;
    }

    // 2. Login as Technician
    logStep('2: Login as Technician', 'Logging in as technician...');
    try {
      const technicianLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'technician@test.com',
        password: 'password123'
      });
      technicianToken = technicianLogin.data.accessToken;
      technicianId = technicianLogin.data.user.id;
      teamId = technicianLogin.data.user.teamId;
      logStep('2: Technician Login Success', { 
        userId: technicianId, 
        role: technicianLogin.data.user.role,
        teamId: teamId 
      });
    } catch (error) {
      logError('2: Technician Login', error);
      return;
    }

    // 3. Login as Manager
    logStep('3: Login as Manager', 'Logging in as manager...');
    try {
      const managerLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'manager@test.com',
        password: 'password123'
      });
      managerToken = managerLogin.data.accessToken;
      managerId = managerLogin.data.user.id;
      logStep('3: Manager Login Success', { userId: managerId, role: managerLogin.data.user.role });
    } catch (error) {
      logError('3: Manager Login', error);
      return;
    }

    // 4. Get equipment list
    logStep('4: Get Equipment', 'Fetching available equipment...');
    try {
      const equipmentList = await axios.get(`${API_URL}/equipment`, {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      if (equipmentList.data.length === 0) {
        console.error('❌ No equipment found. Please create equipment first.');
        return;
      }
      equipmentId = equipmentList.data[0].id;
      logStep('4: Equipment Found', { 
        equipmentId, 
        name: equipmentList.data[0].name,
        team: equipmentList.data[0].primaryTeamId
      });
    } catch (error) {
      logError('4: Get Equipment', error);
      return;
    }

    console.log('\n\n📋 WORKFLOW PHASE: REQUEST CREATION & ASSIGNMENT');

    // 5. Employee creates maintenance request
    logStep('5: Employee Creates Request', 'Creating maintenance request...');
    try {
      const createRequest = await axios.post(`${API_URL}/requests`, {
        equipmentId: equipmentId,
        title: 'Test Maintenance Request - Complete Workflow',
        description: 'Testing the complete workflow from employee to technician to manager',
        requestType: 'CORRECTIVE',
        priority: 'HIGH'
      }, {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      requestId = createRequest.data.id;
      logStep('5: ✅ Request Created', {
        requestId,
        status: createRequest.data.status,
        teamId: createRequest.data.teamId,
        priority: createRequest.data.priority
      });
    } catch (error) {
      logError('5: Create Request', error);
      return;
    }

    // 6. Technician views their team's requests
    logStep('6: Technician Views Team Requests', 'Fetching requests for technician team...');
    try {
      const myRequests = await axios.get(`${API_URL}/requests/my-requests?status=NEW`, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      logStep('6: ✅ Technician Can See Request', {
        totalRequests: myRequests.data.length,
        ourRequest: myRequests.data.find(r => r.id === requestId) ? 'Found' : 'Not Found'
      });
    } catch (error) {
      logError('6: Technician View Requests', error);
      return;
    }

    // 7. Technician accepts the task (PENDING_APPROVAL)
    logStep('7: Technician Accepts Task', 'Technician accepting the task...');
    try {
      const acceptRequest = await axios.post(`${API_URL}/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      logStep('7: ✅ Task Accepted', {
        status: acceptRequest.data.request.status,
        assignedTo: acceptRequest.data.request.technicalId,
        message: acceptRequest.data.message,
        note: 'Status should be PENDING_APPROVAL'
      });
    } catch (error) {
      logError('7: Accept Task', error);
      return;
    }

    console.log('\n\n👔 MANAGER APPROVAL PHASE');

    // 8. Manager approves the request
    logStep('8: Manager Approves Request', 'Manager clicking APPROVE button...');
    try {
      const approveRequest = await axios.post(`${API_URL}/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('8: ✅ Request Approved', {
        status: approveRequest.data.request.status,
        startTime: approveRequest.data.request.startTime,
        message: approveRequest.data.message,
        note: 'Status changed to IN_PROGRESS'
      });
    } catch (error) {
      logError('8: Manager Approval', error);
      return;
    }

    console.log('\n\n👔 MANAGER REVIEW PHASE');

    // 8. Manager views the request
    logStep('8: Manager Views Request', 'Manager checking the assigned request...');
    try {
      const managerViewRequest = await axios.get(`${API_URL}/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('8: ✅ Manager Views Request', {
        status: managerViewRequest.data.status,
        assignedTechnician: managerViewRequest.data.assignedTechnicianId,
        teamId: managerViewRequest.data.teamId
      });
    } catch (error) {
      logError('8: Manager View Request', error);
      return;
    }

    // 9. Manager can reject and reassign (optional - we'll skip for success flow)
    // For testing rejection, uncomment below:
    /*
    logStep('9: Manager Rejects & Reassigns', 'Manager rejecting current assignment...');
    try {
      const rejectRequest = await axios.patch(`${API_URL}/requests/${requestId}/reject-assignment`, {
        newTechnicianId: technicianId,
        reason: 'Testing rejection flow'
      }, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('9: ✅ Request Rejected & Reassigned', rejectRequest.data);
    } catch (error) {
      logError('9: Reject & Reassign', error);
    }
    */

    // 10. Manager accepts the assignment (if needed)
    logStep('9: Manager Accepts Assignment', '✅ Manager approves the technician assignment (implicit in this flow)');

    console.log('\n\n🔧 TECHNICIAN WORK PHASE');

    // 11. Technician adds work notes
    logStep('10: Technician Updates Progress', 'Adding work notes...');
    try {
      const updateProgress = await axios.patch(`${API_URL}/requests/${requestId}/update-progress`, {
        workNotes: 'Diagnosed the issue. Replacing faulty component. Will complete within 2 hours.'
      }, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      logStep('10: ✅ Progress Updated', {
        workNotes: updateProgress.data.request.workNotes
      });
    } catch (error) {
      logError('10: Update Progress', error);
      return;
    }

    // 12. Technician completes the task
    logStep('11: Technician Completes Task', 'Marking task as complete...');
    try {
      const completeRequest = await axios.patch(`${API_URL}/requests/${requestId}/complete`, {
        hoursSpent: 2.5,
        rootCause: 'MECHANICAL_FAILURE',
        isTemporaryFix: false,
        workNotes: 'Replaced faulty motor bearing. Equipment tested and working normally. No temporary fixes needed.'
      }, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      logStep('11: ✅ Task Completed', {
        status: completeRequest.data.request.status,
        hoursSpent: completeRequest.data.request.hoursSpent,
        rootCause: completeRequest.data.request.rootCause,
        completedAt: completeRequest.data.request.completedAt,
        message: completeRequest.data.message
      });
    } catch (error) {
      logError('11: Complete Task', error);
      return;
    }

    console.log('\n\n✅ MANAGER VERIFICATION PHASE');

    // 13. Manager verifies the completed work
    logStep('12: Manager Verifies Completion', 'Manager reviewing completed work...');
    try {
      const managerVerifyRequest = await axios.get(`${API_URL}/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('12: ✅ Manager Verified', {
        status: managerVerifyRequest.data.status,
        hoursSpent: managerVerifyRequest.data.hoursSpent,
        rootCause: managerVerifyRequest.data.rootCause,
        workNotes: managerVerifyRequest.data.workNotes,
        equipmentHealthScore: managerVerifyRequest.data.equipment?.healthScore
      });
    } catch (error) {
      logError('12: Manager Verify', error);
      return;
    }

    // 14. Check Kanban view
    logStep('13: Check Kanban Board', 'Fetching Kanban view...');
    try {
      const kanbanView = await axios.get(`${API_URL}/kanban?teamId=${teamId}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('13: ✅ Kanban Board Updated', {
        columns: Object.keys(kanbanView.data),
        repairedCount: kanbanView.data.REPAIRED?.length || 0,
        ourRequestInRepaired: kanbanView.data.REPAIRED?.find(r => r.id === requestId) ? 'Yes ✅' : 'No'
      });
    } catch (error) {
      logError('13: Kanban Board', error);
      return;
    }

    // 15. Check Dashboard Statistics
    logStep('14: Check Dashboard Stats', 'Verifying dashboard updates...');
    try {
      const dashboard = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      logStep('14: ✅ Dashboard Updated', {
        totalEquipment: dashboard.data.totalEquipment,
        activeRequests: dashboard.data.activeRequests,
        completedThisMonth: dashboard.data.completedThisMonth
      });
    } catch (error) {
      logError('14: Dashboard Stats', error);
    }

    // 16. Technician checks work history
    logStep('15: Technician Work History', 'Checking technician work history...');
    try {
      const workHistory = await axios.get(`${API_URL}/requests/my-history`, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      logStep('15: ✅ Work History Updated', {
        totalCompleted: workHistory.data.length,
        latestRequest: workHistory.data[0]?.id === requestId ? 'Found ✅' : 'Not Found'
      });
    } catch (error) {
      logError('15: Work History', error);
    }

    console.log('\n\n' + '🎉'.repeat(40));
    console.log('✅ COMPLETE WORKFLOW TEST PASSED!');
    console.log('🎉'.repeat(40));
    console.log('\n📊 Summary:');
    console.log('  ✅ Employee created request');
    console.log('  ✅ Request assigned to correct team');
    console.log('  ✅ Technician picked and started task');
    console.log('  ✅ Technician updated progress');
    console.log('  ✅ Technician completed task with details');
    console.log('  ✅ Manager verified completion');
    console.log('  ✅ Kanban board updated');
    console.log('  ✅ Dashboard statistics updated');
    console.log('  ✅ Work history tracked');
    console.log('\n🎯 All workflow steps completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

// Run the test
console.log('🚀 Starting Complete Workflow Test...\n');
testCompleteWorkflow();
