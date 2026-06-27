import {
  initializeSeedData,
  getLeads,
  getLead,
  createLead,
  updateLead,
  addLeadActivity,
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  getBookings,
  getBooking,
  createBooking,
  createBookingFromForm,
  updateBooking,
  findOrCreateCustomerFromLead,
  getCustomerNotes,
  createCustomerNote,
  deleteCustomerNote,
  getCustomerDocuments,
  createCustomerDocument,
  deleteCustomerDocument,
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  getBranches,
  getBranch,
  getUsers,
  getUser,
  createUser,
  updateUser,
  getAgents,
  getExpenses,
  createExpense,
  updateExpense,
  getRoles,
  updateRolePermissions,
  getDashboardStats,
} from "./data-service";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureSeeded() {
  if (typeof window !== "undefined") {
    initializeSeedData();
  }
}

export const MockAPI = {
  getDashboardStats: async () => {
    await delay(200);
    ensureSeeded();
    return getDashboardStats();
  },
  getLeads: async () => {
    await delay(200);
    ensureSeeded();
    return getLeads();
  },
  getLead: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return getLead(id);
  },
  createLead: async (values: Parameters<typeof createLead>[0]) => {
    await delay(400);
    ensureSeeded();
    return createLead(values);
  },
  updateLead: async (id: string, data: Parameters<typeof updateLead>[1]) => {
    await delay(300);
    ensureSeeded();
    return updateLead(id, data);
  },
  addLeadActivity: async (
    leadId: string,
    activity: Parameters<typeof addLeadActivity>[1]
  ) => {
    await delay(300);
    ensureSeeded();
    return addLeadActivity(leadId, activity);
  },
  getCustomers: async () => {
    await delay(200);
    ensureSeeded();
    return getCustomers();
  },
  getCustomer: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return getCustomer(id);
  },
  createCustomer: async (values: Parameters<typeof createCustomer>[0]) => {
    await delay(400);
    ensureSeeded();
    return createCustomer(values);
  },
  updateCustomer: async (id: string, values: Parameters<typeof updateCustomer>[1]) => {
    await delay(400);
    ensureSeeded();
    return updateCustomer(id, values);
  },
  getBookings: async () => {
    await delay(200);
    ensureSeeded();
    return getBookings();
  },
  getBooking: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return getBooking(id);
  },
  createBooking: async (input: Parameters<typeof createBooking>[0]) => {
    await delay(500);
    ensureSeeded();
    return createBooking(input);
  },
  createBookingFromForm: async (values: Parameters<typeof createBookingFromForm>[0]) => {
    await delay(500);
    ensureSeeded();
    return createBookingFromForm(values);
  },
  updateBooking: async (id: string, values: Parameters<typeof updateBooking>[1]) => {
    await delay(400);
    ensureSeeded();
    return updateBooking(id, values);
  },
  findOrCreateCustomerFromLead: async (lead: Parameters<typeof findOrCreateCustomerFromLead>[0]) => {
    await delay(200);
    ensureSeeded();
    return findOrCreateCustomerFromLead(lead);
  },
  getCustomerNotes: async (customerId: string) => {
    await delay(150);
    ensureSeeded();
    return getCustomerNotes(customerId);
  },
  createCustomerNote: async (customerId: string, note: string) => {
    await delay(300);
    ensureSeeded();
    return createCustomerNote(customerId, note);
  },
  deleteCustomerNote: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return deleteCustomerNote(id);
  },
  getCustomerDocuments: async (customerId: string) => {
    await delay(150);
    ensureSeeded();
    return getCustomerDocuments(customerId);
  },
  createCustomerDocument: async (
    customerId: string,
    doc: Parameters<typeof createCustomerDocument>[1]
  ) => {
    await delay(400);
    ensureSeeded();
    return createCustomerDocument(customerId, doc);
  },
  deleteCustomerDocument: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return deleteCustomerDocument(id);
  },
  getSuppliers: async () => {
    await delay(200);
    ensureSeeded();
    return getSuppliers();
  },
  getSupplier: async (id: string) => {
    await delay(200);
    ensureSeeded();
    return getSupplier(id);
  },
  createSupplier: async (values: Parameters<typeof createSupplier>[0]) => {
    await delay(400);
    ensureSeeded();
    return createSupplier(values);
  },
  updateSupplier: async (id: string, values: Parameters<typeof updateSupplier>[1]) => {
    await delay(400);
    ensureSeeded();
    return updateSupplier(id, values);
  },
  getBranches: async () => {
    await delay(150);
    ensureSeeded();
    return getBranches();
  },
  getBranch: async (id: string) => {
    await delay(150);
    ensureSeeded();
    return getBranch(id);
  },
  getUsers: async () => {
    await delay(150);
    ensureSeeded();
    return getUsers();
  },
  getUser: async (id: string) => {
    await delay(150);
    ensureSeeded();
    return getUser(id);
  },
  createUser: async (values: Parameters<typeof createUser>[0]) => {
    await delay(400);
    ensureSeeded();
    return createUser(values);
  },
  updateUser: async (id: string, values: Parameters<typeof updateUser>[1]) => {
    await delay(400);
    ensureSeeded();
    return updateUser(id, values);
  },
  getAgents: async () => {
    await delay(150);
    ensureSeeded();
    return getAgents();
  },
  getExpenses: async () => {
    await delay(200);
    ensureSeeded();
    return getExpenses();
  },
  getExpense: async (id: string) => {
    await delay(200);
    ensureSeeded();
    const expenses = getExpenses();
    return expenses.find((e) => e.id === id || e.expenseRef === id) ?? null;
  },
  createExpense: async (values: Parameters<typeof createExpense>[0]) => {
    await delay(400);
    ensureSeeded();
    return createExpense(values);
  },
  updateExpense: async (id: string, values: Parameters<typeof updateExpense>[1]) => {
    await delay(400);
    ensureSeeded();
    return updateExpense(id, values);
  },
  getRoles: async () => {
    await delay(150);
    ensureSeeded();
    return getRoles();
  },
  updateRolePermissions: async (roleId: string, permissions: string[]) => {
    await delay(300);
    ensureSeeded();
    return updateRolePermissions(roleId, permissions);
  },
};
