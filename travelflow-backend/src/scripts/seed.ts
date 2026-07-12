import { connectDatabase } from "../config/database";
import {
  Agency,
  Branch,
  User,
  Role,
  Lead,
  LeadActivity,
  Customer,
  Booking,
  Expense,
  Supplier,
} from "../models";

async function seed() {
  console.log("Connecting to database...");
  await connectDatabase();

  console.log("Clearing existing data...");
  await Promise.all([
    Agency.deleteMany({}),
    Branch.deleteMany({}),
    User.deleteMany({}),
    Role.deleteMany({}),
    Lead.deleteMany({}),
    LeadActivity.deleteMany({}),
    Customer.deleteMany({}),
    Booking.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  console.log("Creating Agency...");
  const agency = await Agency.create({
    name: "Trip trails Co.",
    domain: "Trip-trails.test",
    city: "Karachi",
    contactPhone: "+92 21 111 222 333",
    contactEmail: "hello@triptrails.com",
    code: "Trip",
    slug: "Trip-trails",
    status: "active",
  });
  const agencyId = agency._id;

  console.log("Creating Branches...");
  const branches = await Branch.insertMany([
    {
      agencyId,
      name: "Karachi Main Office",
      code: "KHI-HQ",
      city: "Karachi",
      address: "Suite 400, Business Avenue, Main Boulevard",
      phone: "+92 21 111 222 333",
      isHeadOffice: true,
      status: "active",
    },
    {
      agencyId,
      name: "Lahore Branch",
      code: "LHR-01",
      city: "Lahore",
      address: "15-A, Gulberg III",
      phone: "+92 42 111 222 333",
      isHeadOffice: false,
      status: "active",
    },
    {
      agencyId,
      name: "Islamabad Office",
      code: "ISB-01",
      city: "Islamabad",
      address: "F-8 Markaz",
      phone: "+92 51 111 222 333",
      isHeadOffice: false,
      status: "active",
    },
  ]);

  const [khiBranch, lhrBranch, isbBranch] = branches;

  console.log("Creating Roles...");
  const defaultPermissions = ["leads:read", "leads:write", "customers:read", "customers:write"];
  await Role.insertMany([
    { agencyId, name: "admin", permissions: ["all"], isSystem: true, color: "#1e293b", textColor: "#ffffff" },
    { agencyId, name: "manager", permissions: [...defaultPermissions, "reports:read"], isSystem: true, color: "#3b82f6", textColor: "#ffffff" },
    { agencyId, name: "agent", permissions: defaultPermissions, isSystem: true, color: "#22c55e", textColor: "#ffffff" },
    { agencyId, name: "accountant", permissions: ["expenses:read", "expenses:write"], isSystem: true, color: "#eab308", textColor: "#ffffff" },
  ]);

  console.log("Creating Users...");

  // Note: We use .create() here instead of .insertMany() because we need Mongoose to run
  // the 'pre-save' hook that automatically hashes the password using bcrypt.

  // Admin
  const adminUser = await User.create({
    agencyId,
    branchId: khiBranch._id,
    firstName: "Admin",
    lastName: "User",
    email: "admin@triptrails.com",
    password: "password123",
    role: "admin",
    status: "active",
  });

  // Managers
  await User.create([
    { agencyId, branchId: khiBranch._id, firstName: "KHI", lastName: "Manager", email: "khi.mgr@triptrails.com", password: "password123", role: "manager", status: "active" },
    { agencyId, branchId: lhrBranch._id, firstName: "LHR", lastName: "Manager", email: "lhr.mgr@triptrails.com", password: "password123", role: "manager", status: "active" },
    { agencyId, branchId: isbBranch._id, firstName: "ISB", lastName: "Manager", email: "isb.mgr@triptrails.com", password: "password123", role: "manager", status: "active" },
  ]);

  // Agents
  const agents = await User.create([
    { agencyId, branchId: khiBranch._id, firstName: "Ali", lastName: "Agent", email: "ali@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Sara", lastName: "Agent", email: "sara@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Ahmad", lastName: "Agent", email: "Ahmad@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Umair", lastName: "Agent", email: "Umair@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Azmat", lastName: "Agent", email: "Azmat@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Bushra", lastName: "Agent", email: "Bushra@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Asim", lastName: "Agent", email: "Asim@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Shahrukh", lastName: "Agent", email: "Shahrukh@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: khiBranch._id, firstName: "Zaid", lastName: "Agent", email: "Zaid@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: lhrBranch._id, firstName: "Zain", lastName: "Agent", email: "zain@triptrails.com", password: "password123", role: "agent", status: "active" },
    { agencyId, branchId: isbBranch._id, firstName: "Omer", lastName: "Agent", email: "omer@triptrails.com", password: "password123", role: "agent", status: "active" },
  ]);

  console.log("Creating Customers...");
  const customersData = Array.from({ length: 35 }).map((_, i) => ({
    agencyId,
    customerRef: `CUS-${String(i + 1).padStart(4, "0")}`,
    firstName: `Customer${i + 1}`,
    lastName: "Smith",
    email: `customer${i + 1}@example.com`,
    phone: `+9230000000${i.toString().padStart(2, "0")}`,
    type: i % 3 === 0 ? "corporate" : "individual",
    status: "active",
  }));
  const customers = await Customer.insertMany(customersData);

  console.log("Creating Suppliers...");
  const supplier = await Supplier.create({
    agencyId,
    name: "Emirates Airlines",
    type: "flight",
    category: "Airline",
    contactName: "Ali Ahmed",
    email: "ali@emirates.com",
    phone: "+971 4 000 0000",
    status: "active",
  });

  console.log("Creating Leads & Bookings...");
  const sources = ["Walk-in", "WhatsApp", "Facebook", "Referral", "Website"];
  const statuses = ["new", "contacted", "qualified", "proposal", "won", "lost"];

  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const branch = branches[i % branches.length];
    const agent = agents[i % agents.length];
    const source = sources[i % sources.length];
    const status = statuses[i % statuses.length];

    // Create random dates in the past 6 months
    const createdAt = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);

    const lead = await Lead.create({
      agencyId,
      branchId: branch._id,
      leadRef: `LD-${String(i + 1).padStart(4, "0")}`,
      name: `Lead ${i + 1}`,
      phone: `+9233300000${i.toString().padStart(2, "0")}`,
      destination: i % 2 === 0 ? "Dubai" : "London",
      budget: 150000 + (Math.random() * 500000),
      source,
      status,
      assignedAgentId: agent._id,
      createdAt,
    });

    if (status === "won") {
      const customer = customers[i % customers.length];
      const salePrice = 200000 + (Math.random() * 300000);
      const profit = salePrice * (0.05 + Math.random() * 0.1); // 5-15% profit
      const costPrice = salePrice - profit;

      await Booking.create({
        agencyId,
        branchId: branch._id,
        bookingRef: `BK-${String(i + 1).padStart(4, "0")}`,
        customerId: customer._id,
        leadId: lead._id,
        agentId: agent._id,
        type: "flight",
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        salePrice,
        costPrice,
        profit,
        profitMargin: (profit / salePrice) * 100,
        supplierId: supplier._id,
        airline: "Emirates",
        departureCity: "KHI",
        arrivalCity: i % 2 === 0 ? "DXB" : "LHR",
        departureDate: new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000), // Departs 10 days after lead
        date: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000), // Booked 2 days after lead
      });
    }
  }

  console.log("Creating Expenses...");
  for (let i = 0; i < 25; i++) {
    const branch = branches[i % branches.length];
    await Expense.create({
      agencyId,
      branchId: branch._id,
      expenseRef: `EXP-${String(i + 1).padStart(4, "0")}`,
      title: i % 2 === 0 ? "Office Rent" : "Utilities Bill",
      category: i % 2 === 0 ? "Rent" : "Utilities",
      amount: 50000 + (Math.random() * 50000),
      date: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      paymentMethod: i % 2 === 0 ? "bank_transfer" : "cash",
      recordedById: adminUser._id,
      notes: `Monthly Expense ${i}`,
      status: "approved",
    });
  }

  console.log("Database seeded successfully!");
  console.log("Admin login: admin@triptrails.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
