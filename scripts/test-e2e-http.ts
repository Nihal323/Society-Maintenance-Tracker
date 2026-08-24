/**
 * Complete End-to-End HTTP Flow Tester for Live Next.js Dev Server (http://localhost:3000)
 */

async function runE2ETests() {
  const BASE_URL = "http://localhost:3000";
  console.log(`\n🌐 Running Live HTTP E2E Tests against ${BASE_URL}...\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, detail || "");
      failed++;
    }
  }

  // 1. Check Homepage GET
  const homeRes = await fetch(`${BASE_URL}/`);
  assert(homeRes.status === 200, "Home page responds with HTTP 200 OK");
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes("SOCIETY TRACKER"), "Home page contains application branding");

  // 2. Test Invalid Login
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@society.com", password: "WrongPassword" }),
  });
  assert(badLoginRes.status === 401, "Invalid password login returns HTTP 401 Unauthorized");

  // 3. Test Resident Login
  const residentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "resident@society.com", password: "Resident@123" }),
  });
  assert(residentLoginRes.status === 200, "Resident login returns HTTP 200 OK");
  const residentLoginData = await residentLoginRes.json();
  assert(residentLoginData.data.role === "RESIDENT", "Resident login payload confirms RESIDENT role");

  const residentCookies = residentLoginRes.headers.get("set-cookie") || "";
  assert(residentCookies.includes("society_session="), "Session cookie 'society_session' set on login");

  // 4. Test Authenticated Resident Profile (/api/auth/me)
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: residentCookies },
  });
  const meData = await meRes.json();
  assert(meData.data.email === "resident@society.com", "Resident profile retrieved successfully via session cookie");

  // 5. Test Resident Complaints List
  const residentComplaintsRes = await fetch(`${BASE_URL}/api/complaints`, {
    headers: { Cookie: residentCookies },
  });
  const residentComplaintsData = await residentComplaintsRes.json();
  assert(residentComplaintsData.success === true, "Resident can query their complaints list");
  assert(
    residentComplaintsData.data.every((c: any) => c.residentId === residentLoginData.data.id),
    "Resident ONLY receives complaints belonging to their own account"
  );

  // 6. Test Resident Creating a New Complaint
  const createComplaintRes = await fetch(`${BASE_URL}/api/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: residentCookies,
    },
    body: JSON.stringify({
      title: "Live E2E Corridor Bulb Flickering",
      category: "Electrical",
      description: "Corridor light outside flat 402 is constantly flickering.",
      photoUrl: null,
    }),
  });
  assert(createComplaintRes.status === 200, "Complaint creation returns HTTP 200 OK");
  const createdComplaintData = await createComplaintRes.json();
  const createdComplaintId = createdComplaintData.data.id;
  assert(createdComplaintData.data.status === "OPEN", "New complaint initialized with status OPEN");
  assert(createdComplaintData.data.priority === "MEDIUM", "New complaint assigned default priority MEDIUM");

  // 7. Verify Complaint Detail & Initial History
  const complaintDetailRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
    headers: { Cookie: residentCookies },
  });
  const complaintDetailData = await complaintDetailRes.json();
  assert(complaintDetailData.data.id === createdComplaintId, "Complaint details fetched successfully");
  assert(complaintDetailData.data.history.length >= 1, "Complaint history timeline contains initial submission log");

  // 8. Test Authorization: Resident Cannot Modify Status (Only Admin allowed)
  const residentPatchRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: residentCookies,
    },
    body: JSON.stringify({ status: "RESOLVED" }),
  });
  assert(residentPatchRes.status === 403, "Resident cannot update complaint status (HTTP 403 Forbidden)");

  // 9. Test Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@society.com", password: "Admin@123" }),
  });
  assert(adminLoginRes.status === 200, "Admin login returns HTTP 200 OK");
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginData.data.role === "ADMIN", "Admin role confirmed in login response");
  const adminCookies = adminLoginRes.headers.get("set-cookie") || "";

  // 10. Test Admin Dashboard Stats API
  const statsRes = await fetch(`${BASE_URL}/api/stats`, {
    headers: { Cookie: adminCookies },
  });
  const statsData = await statsRes.json();
  assert(statsData.data.totalComplaints > 0, "Admin stats returns total complaints count > 0");
  assert(Array.isArray(statsData.data.statusBreakdown), "Status breakdown returned as array");
  assert(Array.isArray(statsData.data.categoryBreakdown), "Category breakdown returned as array");
  assert(statsData.data.overdueThresholdDays === 3, "Overdue threshold returned correctly in stats");

  // 11. Test Admin Complaint Status Transition (OPEN -> IN_PROGRESS)
  const adminPatchInProgressRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({
      status: "IN_PROGRESS",
      note: "Electrician assigned to replace starter and LED bulb.",
    }),
  });
  assert(adminPatchInProgressRes.status === 200, "Admin updates status to IN_PROGRESS (HTTP 200 OK)");
  const inProgressData = await adminPatchInProgressRes.json();
  assert(inProgressData.data.status === "IN_PROGRESS", "Complaint status verified as IN_PROGRESS");

  // 12. Test Admin Complaint Status Transition (IN_PROGRESS -> RESOLVED)
  const adminPatchResolvedRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({
      status: "RESOLVED",
      note: "Bulb replaced with new Philips 18W LED. Tested working.",
    }),
  });
  assert(adminPatchResolvedRes.status === 200, "Admin updates status to RESOLVED (HTTP 200 OK)");
  const resolvedData = await adminPatchResolvedRes.json();
  assert(resolvedData.data.status === "RESOLVED", "Complaint status verified as RESOLVED");
  assert(!!resolvedData.data.resolvedAt, "resolvedAt timestamp is set on resolution");
  assert(resolvedData.data.isOverdue === false, "Resolved complaint is marked isOverdue = false");

  // 13. Verify Complete History Timeline in DB
  const historyRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}/history`, {
    headers: { Cookie: adminCookies },
  });
  const historyData = await historyRes.json();
  assert(historyData.data.length === 3, "Complete audit timeline has 3 sequential immutable entries");

  // 14. Test Notice Creation & Pinning
  const createNoticeRes = await fetch(`${BASE_URL}/api/notices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({
      title: "Live E2E Pinned Emergency Notice",
      content: "Fire alarm sound test will be conducted on Friday between 3 PM and 4 PM.",
      category: "Emergency",
      isPinned: true,
    }),
  });
  assert(createNoticeRes.status === 200, "Notice created successfully (HTTP 200 OK)");
  const createdNoticeData = await createNoticeRes.json();
  const createdNoticeId = createdNoticeData.data.id;

  // 15. Verify Notice List Order (Pinned on top)
  const noticesRes = await fetch(`${BASE_URL}/api/notices`, {
    headers: { Cookie: residentCookies },
  });
  const noticesData = await noticesRes.json();
  assert(noticesData.data[0].isPinned === true, "Important notice is pinned at the top of resident notice board");

  // 16. Test System Configuration Update (Change Overdue Threshold)
  const updateSettingsRes = await fetch(`${BASE_URL}/api/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({
      OVERDUE_THRESHOLD_DAYS: 5,
      SOCIETY_NAME: "Greenwood Heights Residents Association",
    }),
  });
  assert(updateSettingsRes.status === 200, "System settings updated successfully (HTTP 200 OK)");

  const settingsGetRes = await fetch(`${BASE_URL}/api/settings`, {
    headers: { Cookie: adminCookies },
  });
  const settingsGetData = await settingsGetRes.json();
  assert(settingsGetData.data.OVERDUE_THRESHOLD_DAYS === 5, "Overdue threshold updated to 5 days");

  // Restore threshold to 3
  await fetch(`${BASE_URL}/api/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({ OVERDUE_THRESHOLD_DAYS: 3 }),
  });

  // Clean up test notice
  await fetch(`${BASE_URL}/api/notices/${createdNoticeId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookies },
  });

  // 17. Test Logout
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: residentCookies },
  });
  assert(logoutRes.status === 200, "Logout responds with HTTP 200 OK");

  console.log("\n=======================================================");
  console.log(`🎯 LIVE HTTP E2E TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runE2ETests().catch((err) => {
  console.error("E2E Test Error:", err);
  process.exit(1);
});
