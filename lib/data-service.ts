import { mockLeads } from "@/mock-data/leads";
import { mockCustomers } from "@/mock-data/customers";
import { mockBookings } from "@/mock-data/bookings";
import { mockSuppliers } from "@/mock-data/suppliers";
import { mockExpenses } from "@/mock-data/expenses";
import { mockBranches } from "@/mock-data/branches";
import { mockUsers } from "@/mock-data/users";
import { mockRoles } from "@/mock-data/roles";
import { STORAGE_KEYS, StorageService } from "./storage.service";
import { generateRef } from "./ref-generator";
import { reviveDates, reviveList, serializeForStorage } from "./serialize";
import type {
  Lead,
  LeadActivity,
  Customer,
  CustomerNote,
  CustomerDocument,
  Booking,
  Supplier,
  Expense,
  Branch,
  User,
  DashboardStats,
} from "@/types";
import type { LeadFormValues } from "@/features/leads/schemas/lead.schema";
import type { CustomerFormValues } from "@/features/customers/schemas/customer.schema";
import type { SupplierFormValues } from "@/features/suppliers/schemas/supplier.schema";
import type { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import type { BookingFormValues } from "@/features/bookings/schemas/booking.schema";
import type { UserFormValues } from "@/features/users/schemas/user.schema";
import type { Role } from "@/types/role";

type StoredRecord = { id: string; [key: string]: unknown };

const leadsStore = new StorageService<StoredRecord>(STORAGE_KEYS.LEADS);
const customersStore = new StorageService<StoredRecord>(STORAGE_KEYS.CUSTOMERS);
const bookingsStore = new StorageService<StoredRecord>(STORAGE_KEYS.BOOKINGS);
const suppliersStore = new StorageService<StoredRecord>(STORAGE_KEYS.SUPPLIERS);
const expensesStore = new StorageService<StoredRecord>(STORAGE_KEYS.EXPENSES);
const branchesStore = new StorageService<StoredRecord>(STORAGE_KEYS.BRANCHES);
const usersStore = new StorageService<StoredRecord>(STORAGE_KEYS.USERS);
const activitiesStore = new StorageService<StoredRecord>(STORAGE_KEYS.ACTIVITIES);
const notesStore = new StorageService<StoredRecord>(STORAGE_KEYS.NOTES);
const documentsStore = new StorageService<StoredRecord>(STORAGE_KEYS.DOCUMENTS);
const rolesStore = new StorageService<StoredRecord>(STORAGE_KEYS.ROLES);

const CURRENT_USER = "Ahmad Khan";

function now() {
  return new Date().toISOString();
}

function stripBookingRelations(booking: Booking) {
  const { customer, supplier, ...rest } = booking;
  return serializeForStorage(rest);
}

function enrichLead(raw: StoredRecord): Lead {
  const lead = reviveDates(raw) as unknown as Lead;
  const activities = reviveList(
    activitiesStore.query((a) => a.leadId === lead.id) as unknown as LeadActivity[]
  );
  return {
    ...lead,
    adults: lead.adults ?? 1,
    children: lead.children ?? 0,
    activities,
  };
}

function enrichCustomer(raw: StoredRecord): Customer {
  const customer = reviveDates(raw) as unknown as Customer;
  const bookings = getBookingsRaw().filter((b) => b.customerId === customer.id);
  return {
    ...customer,
    totalBookings: bookings.length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.salePrice ?? 0), 0),
    country: customer.country ?? "Pakistan",
  };
}

function enrichBooking(raw: StoredRecord): Booking {
  const booking = reviveDates(raw) as unknown as Booking;
  const customer = customersStore.getById(booking.customerId);
  const supplier = suppliersStore.getById(booking.supplierId);
  return {
    ...booking,
    customer: customer ? (reviveDates(customer) as unknown as Customer) : undefined,
    supplier: supplier ? (reviveDates(supplier) as unknown as Supplier) : undefined,
  };
}

function getBookingsRaw(): Booking[] {
  return reviveList(bookingsStore.getAll() as unknown as Booking[]);
}

export function initializeSeedData() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    rolesStore.seed(mockRoles.map((r) => serializeForStorage(r) as unknown as StoredRecord));
  }

  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

  const leads = mockLeads.map((l) =>
    serializeForStorage({
      ...l,
      adults: l.adults ?? 2,
      children: l.children ?? 0,
      activities: undefined,
    })
  );
  leadsStore.seed(leads as StoredRecord[]);

  mockLeads.forEach((lead) => {
    activitiesStore.create(
      serializeForStorage({
        leadId: lead.id,
        type: "note",
        description: `Lead captured via ${lead.source.replace("_", " ")}`,
        createdBy: CURRENT_USER,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })
    );
  });

  customersStore.seed(mockCustomers.map((c) => serializeForStorage(c) as unknown as StoredRecord));
  bookingsStore.seed(mockBookings.map((b) => stripBookingRelations(b) as unknown as StoredRecord));
  suppliersStore.seed(mockSuppliers.map((s) => serializeForStorage(s) as unknown as StoredRecord));
  expensesStore.seed(mockExpenses.map((e) => serializeForStorage(e) as unknown as StoredRecord));
  branchesStore.seed(mockBranches.map((b) => serializeForStorage(b) as unknown as StoredRecord));
  usersStore.seed(mockUsers.map((u) => serializeForStorage(u) as unknown as StoredRecord));
  rolesStore.seed(mockRoles.map((r) => serializeForStorage(r) as unknown as StoredRecord));

  localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function getLeads(): Lead[] {
  return leadsStore.getAll().map(enrichLead);
}

export function getLead(id: string): Lead | null {
  const raw =
    leadsStore.getById(id) ??
    leadsStore.getAll().find((l) => l.leadRef === id);
  return raw ? enrichLead(raw) : null;
}

export function createLead(values: LeadFormValues): Lead {
  const id = crypto.randomUUID();
  const leadRef = generateRef("LD");
  const timestamp = now();

  const leadData = serializeForStorage({
    id,
    leadRef,
    name: values.name,
    phone: values.phone,
    whatsapp: values.whatsapp || undefined,
    email: values.email || undefined,
    destination: values.destination,
    travelDate: values.travelDate ? new Date(values.travelDate).toISOString() : undefined,
    budget: values.budget,
    adults: values.adults ?? 1,
    children: values.children ?? 0,
    specialRequirements: values.specialRequirements || undefined,
    source: values.source,
    status: values.status,
    assignedAgentId: values.assignedAgentId || undefined,
    branchId: values.branchId || "br-1",
    notes: values.notes || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  leadsStore.create(leadData);

  activitiesStore.create(
    serializeForStorage({
      leadId: id,
      type: "note",
      description: "Lead captured",
      createdBy: CURRENT_USER,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  );

  return enrichLead(leadData);
}

export function updateLead(id: string, data: Partial<Lead> | LeadFormValues): Lead | null {
  const payload =
    "name" in data && typeof data.name === "string"
      ? serializeForStorage({
          name: data.name,
          phone: (data as LeadFormValues).phone,
          whatsapp: (data as LeadFormValues).whatsapp || undefined,
          email: (data as LeadFormValues).email || undefined,
          destination: (data as LeadFormValues).destination,
          travelDate: (data as LeadFormValues).travelDate
            ? new Date((data as LeadFormValues).travelDate!).toISOString()
            : undefined,
          budget: (data as LeadFormValues).budget,
          adults: (data as LeadFormValues).adults ?? 1,
          children: (data as LeadFormValues).children ?? 0,
          specialRequirements: (data as LeadFormValues).specialRequirements || undefined,
          source: (data as LeadFormValues).source,
          status: (data as LeadFormValues).status,
          assignedAgentId: (data as LeadFormValues).assignedAgentId || undefined,
          branchId: (data as LeadFormValues).branchId || "br-1",
          notes: (data as LeadFormValues).notes || undefined,
          updatedAt: now(),
        })
      : serializeForStorage({ ...data, updatedAt: now() });
  const updated = leadsStore.update(id, payload);
  return updated ? enrichLead(updated) : null;
}

export function addLeadActivity(
  leadId: string,
  activity: Omit<LeadActivity, "id" | "leadId" | "createdAt"> & { createdAt?: Date }
): LeadActivity {
  const timestamp = activity.createdAt?.toISOString() ?? now();
  const record = activitiesStore.create(
    serializeForStorage({
      leadId,
      type: activity.type,
      description: activity.description,
      outcome: activity.outcome,
      createdBy: activity.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  );
  leadsStore.update(leadId, { lastContactedAt: timestamp, updatedAt: now() });
  return reviveDates(record) as unknown as LeadActivity;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function getCustomers(): Customer[] {
  return customersStore.getAll().map(enrichCustomer);
}

export function getCustomer(id: string): Customer | null {
  const raw =
    customersStore.getById(id) ??
    customersStore.getAll().find((c) => c.customerRef === id);
  return raw ? enrichCustomer(raw) : null;
}

export function createCustomer(values: CustomerFormValues): Customer {
  const id = crypto.randomUUID();
  const customerRef = generateRef("CUS");
  const timestamp = now();
  const isCorporate = values.type === "corporate";

  const data = serializeForStorage({
    id,
    agencyId: "ag-1",
    customerRef,
    type: values.type,
    firstName: values.firstName,
    lastName: values.lastName,
    companyName: isCorporate ? values.companyName : undefined,
    businessType: isCorporate ? values.businessType : undefined,
    taxNumber: isCorporate ? values.taxNumber : undefined,
    email: values.email || undefined,
    phone: values.phone,
    whatsapp: values.whatsapp || undefined,
    dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
    gender: values.gender,
    cnic: values.cnic || undefined,
    passportNumber: values.passportNumber || undefined,
    city: values.city,
    country: values.country ?? "Pakistan",
    address: values.address || undefined,
    emergencyContactName: values.emergencyContactName || undefined,
    emergencyContactPhone: values.emergencyContactPhone || undefined,
    internalNotes: values.internalNotes || undefined,
    totalBookings: 0,
    totalSpent: 0,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  customersStore.create(data);
  return enrichCustomer(data);
}

export function updateCustomer(id: string, values: CustomerFormValues): Customer | null {
  const isCorporate = values.type === "corporate";
  const updated = customersStore.update(
    id,
    serializeForStorage({
      type: values.type,
      firstName: values.firstName,
      lastName: values.lastName,
      companyName: isCorporate ? values.companyName : undefined,
      businessType: isCorporate ? values.businessType : undefined,
      taxNumber: isCorporate ? values.taxNumber : undefined,
      email: values.email || undefined,
      phone: values.phone,
      whatsapp: values.whatsapp || undefined,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      gender: values.gender,
      cnic: values.cnic || undefined,
      passportNumber: values.passportNumber || undefined,
      city: values.city,
      country: values.country ?? "Pakistan",
      address: values.address || undefined,
      emergencyContactName: values.emergencyContactName || undefined,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
      internalNotes: values.internalNotes || undefined,
      updatedAt: now(),
    })
  );
  return updated ? enrichCustomer(updated) : null;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function getBookings(): Booking[] {
  return bookingsStore.getAll().map(enrichBooking);
}

export function getBooking(id: string): Booking | null {
  const raw =
    bookingsStore.getById(id) ??
    bookingsStore.getAll().find(
      (b) => b.bookingRef === id || b.pnr === id
    );
  return raw ? enrichBooking(raw) : null;
}

export interface CreateBookingInput {
  customerId: string;
  supplierId: string;
  branchId?: string;
  agentId?: string;
  leadId?: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate?: string;
  pnr?: string;
  ticketNumber?: string;
  costPrice: number;
  salePrice: number;
  paymentStatus: Booking["paymentStatus"];
  amountReceived?: number;
  paymentMethod?: string;
  notes?: string;
  adults?: number;
  children?: number;
}

export function createBooking(input: CreateBookingInput): Booking {
  const id = crypto.randomUUID();
  const bookingRef = generateRef("BK");
  const timestamp = now();
  const profit = input.salePrice - input.costPrice;
  const profitMargin = input.salePrice > 0 ? (profit / input.salePrice) * 100 : 0;
  const amountReceived = input.amountReceived ?? 0;
  const balance = input.salePrice - amountReceived;

  const data = serializeForStorage({
    id,
    bookingRef,
    pnr: input.pnr || "",
    ticketNumber: input.ticketNumber,
    customerId: input.customerId,
    supplierId: input.supplierId,
    branchId: input.branchId || "br-1",
    agentId: input.agentId || "user-1",
    leadId: input.leadId,
    airline: input.airline,
    departureCity: input.departureCity,
    arrivalCity: input.arrivalCity,
    departureDate: input.departureDate,
    returnDate: input.returnDate,
    costPrice: input.costPrice,
    salePrice: input.salePrice,
    profit,
    profitMargin,
    bookingStatus: "confirmed",
    paymentStatus: input.paymentStatus,
    amountReceived,
    balance,
    notes: input.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  bookingsStore.create(data);

  if (input.leadId) {
    updateLead(input.leadId, { status: "converted" });
    addLeadActivity(input.leadId, {
      type: "booking_created",
      description: `Converted to Booking ${bookingRef}`,
      createdBy: CURRENT_USER,
    });
  }

  return enrichBooking(data);
}

export function updateBooking(id: string, values: BookingFormValues): Booking | null {
  const profit = values.salePrice - values.costPrice;
  const profitMargin = values.salePrice > 0 ? (profit / values.salePrice) * 100 : 0;
  const amountReceived = values.amountReceived ?? 0;
  const balance = values.salePrice - amountReceived;

  const updated = bookingsStore.update(
    id,
    serializeForStorage({
      customerId: values.customerId,
      supplierId: values.supplierId,
      airline: values.airline,
      departureCity: values.departureCity,
      arrivalCity: values.arrivalCity,
      departureDate: values.departureDate.toISOString(),
      returnDate: values.returnDate?.toISOString(),
      pnr: values.pnr,
      ticketNumber: values.ticketNumber || undefined,
      costPrice: values.costPrice,
      salePrice: values.salePrice,
      profit,
      profitMargin,
      paymentStatus: values.paymentStatus,
      amountReceived,
      balance,
      notes: values.notes || undefined,
      updatedAt: now(),
    })
  );
  return updated ? enrichBooking(updated) : null;
}

export function createBookingFromForm(values: BookingFormValues): Booking {
  return createBooking({
    customerId: values.customerId,
    supplierId: values.supplierId,
    airline: values.airline,
    departureCity: values.departureCity,
    arrivalCity: values.arrivalCity,
    departureDate: values.departureDate.toISOString(),
    returnDate: values.returnDate?.toISOString(),
    pnr: values.pnr,
    ticketNumber: values.ticketNumber,
    costPrice: values.costPrice,
    salePrice: values.salePrice,
    paymentStatus: values.paymentStatus,
    amountReceived: values.amountReceived,
    notes: values.notes,
  });
}

export function findOrCreateCustomerFromLead(lead: Lead): Customer {
  const existing = getCustomers().find((c) => c.phone.replace(/\D/g, "") === lead.phone.replace(/\D/g, ""));
  if (existing) return existing;

  const parts = lead.name.trim().split(/\s+/);
  const firstName = parts[0] ?? lead.name;
  const lastName = parts.slice(1).join(" ") || firstName;

  return createCustomer({
    type: "individual",
    firstName,
    lastName,
    email: lead.email ?? "",
    phone: lead.phone,
    whatsapp: lead.whatsapp ?? "",
    city: "Karachi",
    country: "Pakistan",
  });
}

// ─── Notes & Documents ───────────────────────────────────────────────────────

export function getCustomerNotes(customerId: string): CustomerNote[] {
  return reviveList(
    notesStore.query((n) => n.customerId === customerId) as unknown as CustomerNote[]
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createCustomerNote(customerId: string, note: string): CustomerNote {
  const timestamp = now();
  const record = notesStore.create(
    serializeForStorage({
      customerId,
      note,
      addedBy: CURRENT_USER,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  );
  return reviveDates(record) as unknown as CustomerNote;
}

export function deleteCustomerNote(id: string): boolean {
  return notesStore.delete(id);
}

export function getCustomerDocuments(customerId: string): CustomerDocument[] {
  return reviveList(
    documentsStore.query((d) => d.customerId === customerId) as unknown as CustomerDocument[]
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createCustomerDocument(
  customerId: string,
  doc: Omit<CustomerDocument, "id" | "customerId" | "uploadedBy" | "createdAt" | "updatedAt">
): CustomerDocument {
  const timestamp = now();
  const record = documentsStore.create(
    serializeForStorage({
      customerId,
      ...doc,
      uploadedBy: CURRENT_USER,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  );
  return reviveDates(record) as unknown as CustomerDocument;
}

export function deleteCustomerDocument(id: string): boolean {
  return documentsStore.delete(id);
}

// ─── Reference data ──────────────────────────────────────────────────────────

export function getSuppliers(): Supplier[] {
  return reviveList(suppliersStore.getAll() as unknown as Supplier[]);
}

export function getSupplier(id: string): Supplier | null {
  const raw = suppliersStore.getById(id);
  return raw ? (reviveDates(raw) as unknown as Supplier) : null;
}

export function createSupplier(values: SupplierFormValues): Supplier {
  const timestamp = now();
  const data = serializeForStorage({
    id: crypto.randomUUID(),
    agencyId: "ag-1",
    name: values.name,
    category: values.category,
    contactPerson: values.contactPerson || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    city: values.city || undefined,
    country: values.country || undefined,
    balance: 0,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  suppliersStore.create(data);
  return reviveDates(data) as unknown as Supplier;
}

export function updateSupplier(id: string, values: SupplierFormValues): Supplier | null {
  const updated = suppliersStore.update(
    id,
    serializeForStorage({
      name: values.name,
      category: values.category,
      contactPerson: values.contactPerson || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      updatedAt: now(),
    })
  );
  return updated ? (reviveDates(updated) as unknown as Supplier) : null;
}

export function getBranches(): Branch[] {
  return reviveList(branchesStore.getAll() as unknown as Branch[]);
}

export function getBranch(id: string): Branch | null {
  const raw = branchesStore.getById(id);
  return raw ? (reviveDates(raw) as unknown as Branch) : null;
}

export function getUsers(): User[] {
  return reviveList(usersStore.getAll() as unknown as User[]);
}

export function getUser(id: string): User | null {
  const raw = usersStore.getById(id);
  return raw ? (reviveDates(raw) as unknown as User) : null;
}

export function createUser(values: UserFormValues): User {
  const timestamp = now();
  const data = serializeForStorage({
    id: crypto.randomUUID(),
    agencyId: "ag-1",
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone || undefined,
    role: values.role,
    branchId: values.branchId,
    status: values.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  usersStore.create(data);
  return reviveDates(data) as unknown as User;
}

export function updateUser(id: string, values: UserFormValues): User | null {
  const updated = usersStore.update(
    id,
    serializeForStorage({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      role: values.role,
      branchId: values.branchId,
      status: values.status,
      updatedAt: now(),
    })
  );
  return updated ? (reviveDates(updated) as unknown as User) : null;
}

export function getAgents(): User[] {
  return getUsers().filter((u) => u.role === "agent" || u.role === "manager");
}

export function getExpenses(): Expense[] {
  return reviveList(expensesStore.getAll() as unknown as Expense[]);
}

export function createExpense(values: ExpenseFormValues): Expense {
  const timestamp = now();
  const expenseRef = generateRef("EXP");
  const data = serializeForStorage({
    id: crypto.randomUUID(),
    agencyId: "ag-1",
    branchId: "br-1",
    expenseRef,
    title: values.title,
    category: values.category,
    amount: values.amount,
    date: values.date.toISOString(),
    paidTo: values.paidTo || undefined,
    paymentMethod: values.paymentMethod,
    notes: values.notes || undefined,
    recordedById: "user-1",
    status: "approved",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  expensesStore.create(data);
  return reviveDates(data) as unknown as Expense;
}

export function updateExpense(id: string, values: ExpenseFormValues): Expense | null {
  const updated = expensesStore.update(
    id,
    serializeForStorage({
      title: values.title,
      category: values.category,
      amount: values.amount,
      date: values.date.toISOString(),
      paidTo: values.paidTo || undefined,
      paymentMethod: values.paymentMethod,
      notes: values.notes || undefined,
      updatedAt: now(),
    })
  );
  return updated ? (reviveDates(updated) as unknown as Expense) : null;
}

export function getRoles(): Role[] {
  return reviveList(rolesStore.getAll() as unknown as Role[]);
}

export function updateRolePermissions(roleId: string, permissions: string[]): Role | null {
  const updated = rolesStore.update(roleId, serializeForStorage({ permissions, updatedAt: now() }));
  return updated ? (reviveDates(updated) as unknown as Role) : null;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const leads = getLeads();
  const customers = getCustomers();
  const bookings = getBookings();
  const expenses = getExpenses();

  const nowDate = new Date();
  const thisMonth = nowDate.getMonth();
  const thisYear = nowDate.getFullYear();

  const thisMonthBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  return {
    totalLeads: leads.length,
    totalCustomers: customers.length,
    monthlyRevenue: thisMonthBookings.reduce((s, b) => s + b.salePrice, 0),
    monthlyProfit: thisMonthBookings.reduce((s, b) => s + b.profit, 0),
    totalExpenses: thisMonthExpenses.reduce((s, e) => s + e.amount, 0),
    activeBookings: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    trends: {
      leads: 12.5,
      customers: 8.2,
      revenue: 15.4,
      profit: 10.1,
      expenses: -2.4,
      bookings: 5.0,
    },
    sparklines: {
      leads: [10, 25, 15, 30, 28, 40, leads.length || 35],
      customers: [20, 22, 25, 24, 30, 32, customers.length || 35],
      revenue: [30, 25, 40, 35, 50, 45, 60],
      profit: [15, 18, 16, 20, 25, 22, 28],
      expenses: [40, 35, 38, 30, 32, 28, 25],
      bookings: [12, 15, 14, 18, 16, 20, bookings.length || 22],
    },
  };
}

export { CURRENT_USER };
