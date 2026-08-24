import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isComplaintOverdue, computeComplaintAgeDays, enrichComplaintWithOverdue } from "../src/lib/overdue";
import { sendComplaintStatusChangeNotification, sendImportantNoticeNotification } from "../src/lib/email";

const prisma = new PrismaClient();

async function runTests() {
  console.log("\n=======================================================");
  console.log("🧪 SOCIETY MAINTENANCE TRACKER - INTEGRATION TEST SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. AUTHENTICATION & ROLES TEST
  // -----------------------------------------------------------------
  console.log("1. Testing Authentication & User Model...");

  const admin = await prisma.user.findUnique({ where: { email: "admin@society.com" } });
  assert(!!admin && admin.role === "ADMIN", "Admin user exists with role ADMIN");

  const resident = await prisma.user.findUnique({ where: { email: "resident@society.com" } });
  assert(!!resident && resident.role === "RESIDENT", "Resident user exists with role RESIDENT");

  const isPasswordValid = await bcrypt.compare("Admin@123", admin!.passwordHash);
  assert(isPasswordValid, "Password comparison validates correctly via bcrypt");

  const isBadPasswordValid = await bcrypt.compare("WrongPassword", admin!.passwordHash);
  assert(!isBadPasswordValid, "Invalid password rejected by bcrypt");

  // -----------------------------------------------------------------
  // 2. OVERDUE DETECTION LOGIC TEST
  // -----------------------------------------------------------------
  console.log("\n2. Testing Overdue Detection Engine...");

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

  // With threshold = 3 days:
  const is2DaysOldOverdue = isComplaintOverdue(twoDaysAgo, "OPEN", 3);
  assert(!is2DaysOldOverdue, "2-day old OPEN complaint is NOT overdue (threshold=3)");

  const is4DaysOldOverdue = isComplaintOverdue(fourDaysAgo, "OPEN", 3);
  assert(is4DaysOldOverdue, "4-day old OPEN complaint IS overdue (threshold=3)");

  const is4DaysOldResolvedOverdue = isComplaintOverdue(fourDaysAgo, "RESOLVED", 3);
  assert(!is4DaysOldResolvedOverdue, "4-day old RESOLVED complaint is NEVER overdue");

  // Dynamic threshold change to 1 day:
  const is2DaysOldWithThreshold1 = isComplaintOverdue(twoDaysAgo, "OPEN", 1);
  assert(is2DaysOldWithThreshold1, "2-day old OPEN complaint IS overdue when threshold is changed to 1 day");

  // -----------------------------------------------------------------
  // 3. COMPLAINT LIFECYCLE & IMMUTABLE HISTORY TEST
  // -----------------------------------------------------------------
  console.log("\n3. Testing Complaint Lifecycle & Audit Trail...");

  const testComplaint = await prisma.complaint.create({
    data: {
      title: "Test Leaking Pipe under Kitchen Sink",
      description: "Water dripping continuously at approx 1 drop per second.",
      category: "Plumbing",
      priority: "MEDIUM",
      status: "OPEN",
      residentId: resident!.id,
    },
  });

  const initialHistory = await prisma.complaintHistory.create({
    data: {
      complaintId: testComplaint.id,
      previousStatus: null,
      newStatus: "OPEN",
      actorId: resident!.id,
      note: "Complaint submitted by resident.",
    },
  });

  assert(testComplaint.status === "OPEN", "New complaint created with status OPEN");
  assert(initialHistory.newStatus === "OPEN", "Initial history entry created");

  // Transition: OPEN -> IN_PROGRESS
  const inProgressComplaint = await prisma.complaint.update({
    where: { id: testComplaint.id },
    data: { status: "IN_PROGRESS" },
  });

  const history2 = await prisma.complaintHistory.create({
    data: {
      complaintId: testComplaint.id,
      previousStatus: "OPEN",
      newStatus: "IN_PROGRESS",
      actorId: admin!.id,
      note: "Assigned to plumbing technician.",
    },
  });

  assert(inProgressComplaint.status === "IN_PROGRESS", "Complaint transitioned to IN_PROGRESS");

  // Transition: IN_PROGRESS -> RESOLVED
  const resolvedComplaint = await prisma.complaint.update({
    where: { id: testComplaint.id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  const history3 = await prisma.complaintHistory.create({
    data: {
      complaintId: testComplaint.id,
      previousStatus: "IN_PROGRESS",
      newStatus: "RESOLVED",
      actorId: admin!.id,
      note: "Pipe joint tightened and gasket replaced. Leak fixed.",
    },
  });

  assert(resolvedComplaint.status === "RESOLVED", "Complaint transitioned to RESOLVED");
  assert(!!resolvedComplaint.resolvedAt, "resolvedAt timestamp is properly set");

  // Check history count and immutability
  const fullHistory = await prisma.complaintHistory.findMany({
    where: { complaintId: testComplaint.id },
    orderBy: { timestamp: "asc" },
  });

  assert(fullHistory.length === 3, "Full chronological history preserved with 3 entries");
  assert(fullHistory[0].newStatus === "OPEN" && fullHistory[1].newStatus === "IN_PROGRESS" && fullHistory[2].newStatus === "RESOLVED", "History entries reflect correct status transitions in sequence");

  // Clean up test complaint
  await prisma.complaint.delete({ where: { id: testComplaint.id } });

  // -----------------------------------------------------------------
  // 4. NOTICE BOARD & PINNED BROADCAST TEST
  // -----------------------------------------------------------------
  console.log("\n4. Testing Notice Board Management...");

  const testNotice = await prisma.notice.create({
    data: {
      title: "Test Scheduled Power Maintenance",
      content: "Elevator power backup test from 2 PM to 3 PM.",
      category: "Maintenance",
      isPinned: true,
      authorId: admin!.id,
    },
  });

  assert(testNotice.isPinned === true, "Important notice created with isPinned: true");

  const fetchedNotices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  assert(fetchedNotices[0].isPinned === true, "Pinned notices sort to the top of query results");

  // Clean up test notice
  await prisma.notice.delete({ where: { id: testNotice.id } });

  // -----------------------------------------------------------------
  // 5. EMAIL NOTIFICATION FALLBACK TEST
  // -----------------------------------------------------------------
  console.log("\n5. Testing Email Dispatch & Dev Fallback...");

  const emailResult = await sendComplaintStatusChangeNotification({
    to: "resident@society.com",
    residentName: "Alexander Wright",
    complaintId: "test-complaint-id",
    complaintTitle: "Elevator Jerk Issue",
    category: "Lift/Elevator",
    previousStatus: "OPEN",
    newStatus: "RESOLVED",
    actorName: "Marcus Vance (Admin)",
    note: "Bearing lubricated and safety sensors calibrated.",
  });

  assert(emailResult.success === true, "Email service executed without crashing (dev mock logged)");

  const noticeEmailResult = await sendImportantNoticeNotification({
    to: ["resident@society.com", "sarah@society.com"],
    noticeId: "test-notice-id",
    title: "Urgent Water Supply Test",
    content: "Brief shutdown for pump inspection.",
    category: "Emergency",
    authorName: "Marcus Vance",
  });

  assert(noticeEmailResult.success === true, "Notice email broadcast executed without crashing");

  // -----------------------------------------------------------------
  // 6. SYSTEM CONFIGURATION TEST
  // -----------------------------------------------------------------
  console.log("\n6. Testing System Configuration Persistence...");

  const config = await prisma.systemConfiguration.findUnique({
    where: { key: "OVERDUE_THRESHOLD_DAYS" },
  });

  assert(config !== null && config.value === "3", "Default OVERDUE_THRESHOLD_DAYS is stored as 3");

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`🎯 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test suite runtime error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
