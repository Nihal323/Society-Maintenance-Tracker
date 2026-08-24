import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Society Maintenance Tracker database seeding...");

  // 1. Clear existing records safely
  await prisma.complaintHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.systemConfiguration.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned old database entries.");

  // 2. System Configurations
  await prisma.systemConfiguration.createMany({
    data: [
      {
        key: "OVERDUE_THRESHOLD_DAYS",
        value: "3",
        description: "Number of days before an unresolved complaint is marked overdue",
      },
      {
        key: "SOCIETY_NAME",
        value: "Greenwood Heights Residents Association",
        description: "The official name of the residential society",
      },
      {
        key: "DEFAULT_PRIORITY",
        value: "MEDIUM",
        description: "Default priority assigned to newly submitted complaints",
      },
      {
        key: "SOCIETY_ADDRESS",
        value: "42 Orchid Boulevard, Block 4, Silicon Oasis",
        description: "Physical address of the society premises",
      },
      {
        key: "CONTACT_PHONE",
        value: "+1 (555) 019-2834",
        description: "Helpdesk support contact number",
      },
      {
        key: "CONTACT_EMAIL",
        value: "helpdesk@greenwoodheights.org",
        description: "Helpdesk email address",
      },
    ],
  });
  console.log("⚙️ System configuration seeded.");

  // 3. Password Hashes
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const residentPasswordHash = await bcrypt.hash("Resident@123", 10);

  // 4. Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Marcus Vance (Estate Manager)",
      email: "admin@society.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      unitNumber: "Admin Office - G01",
      phone: "+1 555-0100",
    },
  });

  const resident1 = await prisma.user.create({
    data: {
      name: "Alexander Wright",
      email: "resident@society.com",
      passwordHash: residentPasswordHash,
      role: "RESIDENT",
      unitNumber: "Tower A - 402",
      phone: "+1 555-0143",
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "sarah@society.com",
      passwordHash: residentPasswordHash,
      role: "RESIDENT",
      unitNumber: "Tower B - 105",
      phone: "+1 555-0188",
    },
  });

  const resident3 = await prisma.user.create({
    data: {
      name: "Robert Chen",
      email: "robert@society.com",
      passwordHash: residentPasswordHash,
      role: "RESIDENT",
      unitNumber: "Villa 12",
      phone: "+1 555-0199",
    },
  });

  console.log("👥 Users created (1 Admin, 3 Residents).");

  // Helper date calculations
  const now = new Date();
  const daysAgo = (days: number, hours = 0) => {
    const d = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000) - (hours * 60 * 60 * 1000));
    return d;
  };

  // 5. Complaints
  // Complaint 1: OVERDUE Open (6 days old) - Resident 1
  const complaint1 = await prisma.complaint.create({
    data: {
      title: "Basement Parking B2 Severe Water Seepage",
      description: "Severe water leakage from the ceiling near parking slots 45 and 46 in Basement 2. Puddle is expanding and posing a slip hazard for residents walking to the elevator lobby.",
      category: "Plumbing",
      priority: "HIGH",
      status: "OPEN",
      residentId: resident1.id,
      createdAt: daysAgo(6, 4),
      updatedAt: daysAgo(6, 4),
      photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60",
    },
  });

  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint1.id,
      previousStatus: null,
      newStatus: "OPEN",
      actorId: resident1.id,
      note: "Complaint submitted by resident Alexander Wright.",
      timestamp: daysAgo(6, 4),
    },
  });

  // Complaint 2: OVERDUE In-Progress (5 days old) - Resident 2
  const complaint2 = await prisma.complaint.create({
    data: {
      title: "Tower B Passenger Lift #2 Strange Grinding Noise & Jerk",
      description: "Elevator 2 in Tower B is making high-pitched metal grinding sounds between 5th and 8th floors and jerks violently when leveling at floor 7. Needs immediate vendor inspection.",
      category: "Lift/Elevator",
      priority: "HIGH",
      status: "IN_PROGRESS",
      residentId: resident2.id,
      createdAt: daysAgo(5, 2),
      updatedAt: daysAgo(2, 1),
      photoUrl: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&auto=format&fit=crop&q=60",
    },
  });

  await prisma.complaintHistory.createMany({
    data: [
      {
        complaintId: complaint2.id,
        previousStatus: null,
        newStatus: "OPEN",
        actorId: resident2.id,
        note: "Initial report logged via resident portal.",
        timestamp: daysAgo(5, 2),
      },
      {
        complaintId: complaint2.id,
        previousStatus: "OPEN",
        newStatus: "IN_PROGRESS",
        actorId: adminUser.id,
        note: "Otis Elevator maintenance technician dispatched. Parts ordered for suspension pulley bearing.",
        timestamp: daysAgo(2, 1),
      },
    ],
  });

  // Complaint 3: Fresh OPEN (4 hours ago) - Resident 1
  const complaint3 = await prisma.complaint.create({
    data: {
      title: "Pathway Street Light Dark Near Gate 2",
      description: "The LED street light pole right opposite Gate 2 visitor pathway has stopped working, making the pathway completely dark at night.",
      category: "Electrical",
      priority: "MEDIUM",
      status: "OPEN",
      residentId: resident1.id,
      createdAt: daysAgo(0, 4),
      updatedAt: daysAgo(0, 4),
    },
  });

  await prisma.complaintHistory.create({
    data: {
      complaintId: complaint3.id,
      previousStatus: null,
      newStatus: "OPEN",
      actorId: resident1.id,
      note: "Complaint submitted by resident.",
      timestamp: daysAgo(0, 4),
    },
  });

  // Complaint 4: Fresh IN_PROGRESS (1 day ago) - Resident 3
  const complaint4 = await prisma.complaint.create({
    data: {
      title: "Low Water Pressure in Top Floors of Villa Row",
      description: "Water pressure on the upper floor bathrooms has dropped significantly since yesterday morning. Booster pump might have tripped.",
      category: "Water Supply",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      residentId: resident3.id,
      createdAt: daysAgo(1, 8),
      updatedAt: daysAgo(0, 12),
    },
  });

  await prisma.complaintHistory.createMany({
    data: [
      {
        complaintId: complaint4.id,
        previousStatus: null,
        newStatus: "OPEN",
        actorId: resident3.id,
        note: "Complaint raised by Robert Chen (Villa 12).",
        timestamp: daysAgo(1, 8),
      },
      {
        complaintId: complaint4.id,
        previousStatus: "OPEN",
        newStatus: "IN_PROGRESS",
        actorId: adminUser.id,
        note: "Plumbing team assigned to inspect the pressure regulator and rooftop booster pump.",
        timestamp: daysAgo(0, 12),
      },
    ],
  });

  // Complaint 5: RESOLVED (Completed with history) - Resident 1
  const complaint5 = await prisma.complaint.create({
    data: {
      title: "Clubhouse Gymnasium AC Unit Not Cooling",
      description: "The split AC in the cardio section was blowing warm air.",
      category: "Common Area",
      priority: "LOW",
      status: "RESOLVED",
      residentId: resident1.id,
      createdAt: daysAgo(9, 6),
      updatedAt: daysAgo(7, 2),
      resolvedAt: daysAgo(7, 2),
    },
  });

  await prisma.complaintHistory.createMany({
    data: [
      {
        complaintId: complaint5.id,
        previousStatus: null,
        newStatus: "OPEN",
        actorId: resident1.id,
        note: "Reported by Alexander Wright.",
        timestamp: daysAgo(9, 6),
      },
      {
        complaintId: complaint5.id,
        previousStatus: "OPEN",
        newStatus: "IN_PROGRESS",
        actorId: adminUser.id,
        note: "HVAC vendor servicing the coolant line.",
        timestamp: daysAgo(8, 4),
      },
      {
        complaintId: complaint5.id,
        previousStatus: "IN_PROGRESS",
        newStatus: "RESOLVED",
        actorId: adminUser.id,
        note: "Gas refilled and filter cleaned. AC tested and working at 21°C.",
        timestamp: daysAgo(7, 2),
      },
    ],
  });

  // Complaint 6: RESOLVED - Resident 2
  const complaint6 = await prisma.complaint.create({
    data: {
      title: "Corridor Light Fixture Replacement on 4th Floor",
      description: "Two fluorescent tube lights were flickering on Tower A 4th floor corridor.",
      category: "Electrical",
      priority: "LOW",
      status: "RESOLVED",
      residentId: resident2.id,
      createdAt: daysAgo(12, 0),
      updatedAt: daysAgo(11, 0),
      resolvedAt: daysAgo(11, 0),
    },
  });

  await prisma.complaintHistory.createMany({
    data: [
      {
        complaintId: complaint6.id,
        previousStatus: null,
        newStatus: "OPEN",
        actorId: resident2.id,
        note: "Reported by Sarah Connor.",
        timestamp: daysAgo(12, 0),
      },
      {
        complaintId: complaint6.id,
        previousStatus: "OPEN",
        newStatus: "RESOLVED",
        actorId: adminUser.id,
        note: "Replaced both tubes with energy-efficient Philips LED batten lights.",
        timestamp: daysAgo(11, 0),
      },
    ],
  });

  console.log("📋 Complaints & status history timelines seeded.");

  // 6. Notices
  await prisma.notice.create({
    data: {
      title: "🚨 URGENT: Overhead Water Tank Deep Cleaning on Thursday",
      content: `Dear Residents,\n\nPlease be informed that the bi-annual deep chemical cleaning and disinfection of overhead and underground water reservoirs will take place on Thursday from 09:00 AM to 02:00 PM.\n\nWater supply will be suspended during these hours. Please store sufficient water in advance for essential domestic use.\n\nWe regret any inconvenience caused.`,
      category: "Emergency",
      isPinned: true,
      authorId: adminUser.id,
      createdAt: daysAgo(1, 4),
    },
  });

  await prisma.notice.create({
    data: {
      title: "📌 Annual General Body Meeting (AGM) & Community Mixer",
      content: `All property owners and residents are cordially invited to the 2026 Annual General Body Meeting (AGM) scheduled for Saturday, 5:00 PM at the Main Clubhouse Banquet Hall.\n\nAgenda:\n1. Review of annual maintenance audits and financial statements.\n2. Voting on solar rooftop panel installation initiative.\n3. Election of 3 new managing committee members.\n4. High tea and resident meet-and-greet.\n\nYour presence is highly appreciated!`,
      category: "Event",
      isPinned: true,
      authorId: adminUser.id,
      createdAt: daysAgo(3, 0),
    },
  });

  await prisma.notice.create({
    data: {
      title: "Updated Swimming Pool & Health Club Timings",
      content: `Please note that starting this week, the swimming pool will open at 6:00 AM and close at 10:00 PM daily. Tuesdays will be reserved for deep filter maintenance from 11:00 AM to 3:00 PM.\n\nPlease adhere strictly to proper swimwear regulations.`,
      category: "Rules & Regulations",
      isPinned: false,
      authorId: adminUser.id,
      createdAt: daysAgo(5, 0),
    },
  });

  console.log("📢 Notices seeded (2 Pinned, 1 Regular).");
  console.log("\n🎉 Database seeding completed successfully!");
  console.log("-------------------------------------------------------");
  console.log("Demo Credentials:");
  console.log("  Admin:    admin@society.com    / Admin@123");
  console.log("  Resident: resident@society.com / Resident@123");
  console.log("  Resident: sarah@society.com    / Resident@123");
  console.log("-------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
