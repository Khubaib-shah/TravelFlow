import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database";
import {
  Agency,
  Branch,
  User,
  Role,
  Lead,
  LeadActivity,
  Customer,
  Booking,
  Supplier,
  Expense,
} from "../models";

const ROLES = [
  {
    name: "Admin",
    description: "Full access to all modules, settings, and user management.",
    permissions: [
      "Manage Users",
      "All Branches",
      "Financial Reports",
      "System Settings",
      "Delete Records",
    ],
    color: "var(--tf-danger-soft)",
    textColor: "var(--tf-danger)",
  },
  {
    name: "Manager",
    description: "Branch-level management with access to sales and reports.",
    permissions: [
      "Manage Branch Staff",
      "View Reports",
      "Approve Expenses",
      "Manage Bookings",
    ],
    color: "var(--tf-warning-soft)",
    textColor: "var(--tf-warning)",
  },
  {
    name: "Agent",
    description: "Create and manage leads, bookings, and customers.",
    permissions: [
      "Manage Leads",
      "Create Bookings",
      "View Customers",
      "Create Invoices",
    ],
    color: "var(--tf-info-soft)",
    textColor: "var(--tf-info)",
  },
  {
    name: "Accountant",
    description: "Financial operations, expenses, and reporting.",
    permissions: [
      "Financial Reports",
      "Manage Expenses",
      "View Reports",
      "Create Invoices",
    ],
    color: "var(--tf-success-soft)",
    textColor: "var(--tf-success)",
  },
];

async function seed() {
  await connectDatabase();

  await Promise.all([
    Agency.deleteMany({}),
    Branch.deleteMany({}),
    User.deleteMany({}),
    Role.deleteMany({}),
    Lead.deleteMany({}),
    LeadActivity.deleteMany({}),
    Customer.deleteMany({}),
    Booking.deleteMany({}),
    Supplier.deleteMany({}),
    Expense.deleteMany({}),
    mongoose.connection.collection("counters").deleteMany({}),
  ]);

  const agency = await Agency.create({
    name: "TravelFlow Demo Agency",
    slug: "travelflow-demo",
    code: "TF-DEMO",
    contactEmail: "info@travelflow.pk",
    contactPhone: "03001234567",
    city: "Karachi",
    country: "Pakistan",
    currency: "PKR",
    status: "active",
  });

  const agencyId = agency._id;

  const branches = await Branch.insertMany([
    {
      agencyId,
      name: "TripTrails Peshawar",
      city: "Peshawar",
      code: "PSH-HQ",
      isHeadOffice: true,
      status: "active",
    },
    {
      agencyId,
      name: "Karachi Main",
      city: "Karachi",
      code: "KHI-HQ",
      isHeadOffice: true,
      status: "active",
    },
    {
      agencyId,
      name: "Islamabad Branch",
      city: "Islamabad",
      code: "ISB-01",
      isHeadOffice: false,
      status: "active",
    },
    {
      agencyId,
      name: "Lahore Branch",
      city: "Lahore",
      code: "LHE-01",
      isHeadOffice: false,
      status: "active",
    },
    {
      agencyId,
      name: "Dubai Office",
      city: "Dubai",
      code: "DXB-01",
      isHeadOffice: false,
      status: "active",
    },
  ]);

  const [hq, isb] = branches;

  await Role.insertMany(ROLES.map((r) => ({ ...r, agencyId })));

  const [admin, agent, manager] = await User.create([
    {
      agencyId,
      branchId: hq._id,
      firstName: "Admin",
      lastName: "User",
      email: "triptrails.Pakistan.pew@gmail.com",
      password: "admin123",
      role: "admin",
      status: "active",
    },
    {
      agencyId,
      branchId: hq._id,
      firstName: "Admin",
      lastName: "User",
      email: "admin@travelflow.pk",
      password: "admin123",
      role: "admin",
      status: "active",
    },
    {
      agencyId,
      branchId: isb._id,
      firstName: "Sara",
      lastName: "Ali",
      email: "agent@travelflow.pk",
      password: "agent123",
      role: "agent",
      status: "active",
    },
    {
      agencyId,
      branchId: hq._id,
      firstName: "Usman",
      lastName: "Tariq",
      email: "usman@agency.com",
      password: "manager123",
      role: "manager",
      status: "active",
    },
  ]);

  const suppliers = await Supplier.insertMany([
    {
      agencyId,
      name: "Emirates Group",
      category: "airline",
      contactPerson: "Ahmed Ali",
      email: "b2b@emirates.com",
      phone: "+971 4 123 4567",
      city: "Dubai",
      country: "UAE",
      balance: 150000,
      status: "active",
    },
    {
      agencyId,
      name: "Global Consolidators",
      category: "consolidator",
      contactPerson: "Kamran Shah",
      email: "kamran@globalcon.pk",
      phone: "+92 21 111 222 333",
      city: "Karachi",
      country: "Pakistan",
      balance: 450000,
      status: "active",
    },
  ]);

  const customers = await Customer.insertMany([
    {
      agencyId,
      customerRef: "CUS-2026-001",
      type: "individual",
      firstName: "Usman",
      lastName: "Ali",
      email: "usman.ali@example.com",
      phone: "03339988776",
      whatsapp: "03339988776",
      city: "Karachi",
      country: "Pakistan",
      totalBookings: 0,
      totalSpent: 0,
      status: "active",
    },
    {
      agencyId,
      customerRef: "CUS-2026-002",
      type: "corporate",
      firstName: "Ali",
      lastName: "Hassan",
      companyName: "TechCorp Private Ltd",
      email: "travel@techcorp.pk",
      phone: "03007654321",
      city: "Lahore",
      country: "Pakistan",
      totalBookings: 0,
      totalSpent: 0,
      status: "active",
    },
    {
      agencyId,
      customerRef: "CUS-2026-003",
      type: "individual",
      firstName: "Ayesha",
      lastName: "Khan",
      email: "ayesha.k@example.com",
      phone: "03007654322",
      city: "Islamabad",
      country: "Pakistan",
      totalBookings: 0,
      totalSpent: 0,
      status: "inactive",
    },
  ]);

  const leads = await Lead.insertMany([
    {
      agencyId,
      leadRef: "LD-2026-001",
      name: "Ahmed Raza",
      phone: "03001234567",
      whatsapp: "03001234567",
      email: "ahmed.raza@example.com",
      destination: "Dubai",
      travelDate: new Date("2026-05-15"),
      budget: 150000,
      source: "whatsapp",
      status: "new",
      branchId: hq._id,
      adults: 2,
      children: 0,
    },
    {
      agencyId,
      leadRef: "LD-2026-002",
      name: "Sara Khan",
      phone: "03217654321",
      email: "sara.k@example.com",
      destination: "Turkey",
      budget: 350000,
      source: "instagram",
      status: "contacted",
      assignedAgentId: agent._id,
      branchId: isb._id,
      adults: 2,
      children: 1,
      notes: "Looking for a 7-day family package.",
    },
    {
      agencyId,
      leadRef: "LD-2026-003",
      name: "Usman Ali",
      phone: "03339988776",
      destination: "Umrah",
      source: "walk_in",
      status: "converted",
      branchId: hq._id,
      adults: 2,
      children: 0,
    },
    {
      agencyId,
      leadRef: "LD-2026-004",
      name: "Fatima Noor",
      phone: "03451122334",
      destination: "Malaysia",
      source: "facebook",
      status: "follow_up",
      assignedAgentId: manager._id,
      branchId: hq._id,
      adults: 2,
      children: 0,
    },
    {
      agencyId,
      leadRef: "LD-2026-005",
      name: "Zainab Tariq",
      phone: "03124455667",
      destination: "London",
      source: "referral",
      status: "lost",
      branchId: branches[2]._id,
      adults: 1,
      children: 0,
    },
  ]);

  await LeadActivity.insertMany(
    leads.map((lead) => ({
      agencyId,
      leadId: lead._id,
      type: "note",
      description: `Lead captured via ${String(lead.source).replace("_", " ")}`,
      createdBy: `${admin.firstName} ${admin.lastName}`,
    })),
  );

  const now = Date.now();
  await Booking.insertMany([
    {
      agencyId,
      bookingRef: "BK-2026-001",
      pnr: "X7B9Q2",
      ticketNumber: "214-9988776655",
      customerId: customers[0]._id,
      supplierId: suppliers[0]._id,
      branchId: hq._id,
      agentId: admin._id,
      airline: "Emirates",
      departureCity: "KHI",
      arrivalCity: "DXB",
      departureDate: new Date(now + 1000 * 60 * 60 * 24 * 5),
      costPrice: 85000,
      salePrice: 95000,
      profit: 10000,
      profitMargin: (10000 / 95000) * 100,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      amountReceived: 95000,
      balance: 0,
    },
    {
      agencyId,
      bookingRef: "BK-2026-002",
      pnr: "P3M8L1",
      customerId: customers[1]._id,
      supplierId: suppliers[1]._id,
      branchId: isb._id,
      agentId: agent._id,
      airline: "Qatar Airways",
      departureCity: "LHE",
      arrivalCity: "LHR",
      departureDate: new Date(now + 1000 * 60 * 60 * 24 * 14),
      returnDate: new Date(now + 1000 * 60 * 60 * 24 * 28),
      costPrice: 240000,
      salePrice: 265000,
      profit: 25000,
      profitMargin: (25000 / 265000) * 100,
      bookingStatus: "pending",
      paymentStatus: "partial",
      amountReceived: 100000,
      balance: 165000,
    },
    {
      agencyId,
      bookingRef: "BK-2026-003",
      pnr: "J9K2N4",
      customerId: customers[2]._id,
      supplierId: suppliers[0]._id,
      branchId: hq._id,
      agentId: admin._id,
      airline: "Saudi Airlines",
      departureCity: "ISB",
      arrivalCity: "JED",
      departureDate: new Date(now - 1000 * 60 * 60 * 24 * 30),
      costPrice: 160000,
      salePrice: 175000,
      profit: 15000,
      profitMargin: (15000 / 175000) * 100,
      bookingStatus: "completed",
      paymentStatus: "paid",
      amountReceived: 175000,
      balance: 0,
    },
  ]);

  await Expense.insertMany([
    {
      agencyId,
      branchId: hq._id,
      expenseRef: "EXP-2026-001",
      title: "Office Rent - Current Month",
      category: "rent",
      amount: 150000,
      date: new Date(),
      paidTo: "Plaza Management Ltd",
      paymentMethod: "bank_transfer",
      recordedById: admin._id,
      status: "approved",
    },
    {
      agencyId,
      branchId: hq._id,
      expenseRef: "EXP-2026-002",
      title: "Facebook Ads",
      category: "marketing",
      amount: 45000,
      date: new Date(),
      paymentMethod: "credit_card",
      recordedById: admin._id,
      status: "approved",
    },
  ]);

  const year = new Date().getFullYear();
  await (
    mongoose.connection.collection("counters") as {
      insertMany: (docs: unknown[]) => Promise<unknown>;
    }
  ).insertMany([
    { _id: `LD_${String(agencyId)}_${year}`, seq: 5 },
    { _id: `BK_${String(agencyId)}_${year}`, seq: 3 },
    { _id: `CUS_${String(agencyId)}_${year}`, seq: 3 },
    { _id: `EXP_${String(agencyId)}_${year}`, seq: 2 },
  ]);

  console.log("Seed completed successfully.");
  console.log("Demo login: admin@travelflow.pk / admin123");
  console.log("Demo login: agent@travelflow.pk / agent123");

  await disconnectDatabase();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await disconnectDatabase();
  process.exit(1);
});
