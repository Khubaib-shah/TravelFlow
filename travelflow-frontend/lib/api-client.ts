/**
 * TravelFlow API Client
 *
 * Mirrors the exact same interface as MockAPI so pages only change their import.
 * Uses HttpOnly cookies (sent automatically via credentials:"include") — no
 * token is ever stored in JavaScript accessible storage.
 *
 * The Next.js proxy in next.config.ts forwards /api/* → http://localhost:5000/api/*
 * so cookies are always same-origin and SameSite=Lax works in all browsers.
 */

import type {
  Lead,
  Customer,
  CustomerNote,
  CustomerDocument,
  Booking,
  Supplier,
  Branch,
  User,
  DashboardStats,
  Expense,
  Receipt,
  BookingDocument,
} from "@/types";
import type { Role } from "@/types/role";
import type { LeadActivity } from "@/types/lead";
import {
  Quotation,
  QuotationVersion,
  QuotationStatus,
} from "@/types/quotation";
import {
  Template,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplateType,
} from "@/types/template";
import type { QuotationFormValues } from "@/features/quotations/schemas/quotation.schema";
import { ApiError } from "./api-error";

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
import type { LeadFormValues } from "@/features/leads/schemas/lead.schema";
import type { CustomerFormValues } from "@/features/customers/schemas/customer.schema";
import type { SupplierFormValues } from "@/features/suppliers/schemas/supplier.schema";
import type { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import type { BookingFormValues } from "@/features/bookings/schemas/booking.schema";
import type { UserFormValues } from "@/features/users/schemas/user.schema";
import { injectAuthActions } from "@/store/auth.store";

export interface BranchFormValues {
  name: string;
  code?: string;
  city: string;
  address?: string;
  phone?: string;
  isHeadOffice?: boolean;
  status?: "active" | "inactive";
}

import { reviveDates } from "@/lib/serialize";
import { useInvalidationStore } from "@/store/invalidation.store";

// ─── Base URL ─────────────────────────────────────────────────────────────────
// With Next.js rewrites, /api/* is proxied to the Express backend.
// All fetches are same-origin, so HttpOnly cookies are sent automatically.
const BASE = "/api/v1";

// ─── Request Timeout ──────────────────────────────────────────────────────────
// Maximum time (ms) before a request is automatically aborted.
// The error parser will convert AbortError into a friendly "Request timed out" message.
const REQUEST_TIMEOUT_MS = 20_000;

const notifyInvalidation = () => {
  if (typeof window !== "undefined") {
    useInvalidationStore.getState().invalidate();
  }
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
let _isRefreshing = false;
let _pendingRefresh: Promise<void> | null = null;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false,
  options?: { skipBranchScope?: boolean }
): Promise<T> {
  let finalPath = path;

  // Global branch scoping for admins
  if (!options?.skipBranchScope && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("tf-active-branch");
      if (stored) {
        const state = JSON.parse(stored).state;
        const activeBranchId = state?.activeBranchId;
        if (activeBranchId && activeBranchId !== "all") {
          const separator = finalPath.includes("?") ? "&" : "?";
          finalPath = `${finalPath}${separator}branchId=${activeBranchId}`;
        }
      }
    } catch (e) {
      // Ignore local storage parsing errors
    }
  }

  // Abort the request if it takes longer than REQUEST_TIMEOUT_MS
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE}${finalPath}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  // Silent token refresh on 401
  if (
    res.status === 401 &&
    !retried &&
    path !== "/auth/login" &&
    path !== "/auth/refresh-token"
  ) {
    if (!_isRefreshing) {
      _isRefreshing = true;
      _pendingRefresh = fetch(`${BASE}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("Refresh failed");
        })
        .catch(async () => {
          // Refresh failed — explicitly tell backend to clear cookies
          try {
            await fetch(`${BASE}/auth/logout`, {
              method: "POST",
              credentials: "include",
            });
          } catch (e) {}

          // Redirect to login
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
        })
        .finally(() => {
          _isRefreshing = false;
          _pendingRefresh = null;
        });
    }

    await _pendingRefresh;
    // Retry the original request once
    return request<T>(method, path, body, true);
  }

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    if (!res.ok) {
      throw new ApiError(`Server Error: ${res.status} ${res.statusText}`, res.status);
    }
    throw new ApiError("Received invalid JSON from server");
  }

  if (!res.ok) {
    const message =
      (json as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return (json as { data: T }).data;
}

const get = <T>(path: string, options?: { skipBranchScope?: boolean }) => request<T>("GET", path, undefined, false, options);
const post = async <T>(path: string, body: unknown) => {
  const res = await request<T>("POST", path, body);
  if (!path.startsWith("/auth")) notifyInvalidation();
  return res;
};
const patch = async <T>(path: string, body: unknown) => {
  const res = await request<T>("PATCH", path, body);
  notifyInvalidation();
  return res;
};
const del = async <T>(path: string) => {
  const res = await request<T>("DELETE", path);
  notifyInvalidation();
  return res;
};

// ─── Date revival helper ──────────────────────────────────────────────────────
function reviveItem<T>(item: unknown): T {
  return reviveDates(item as Record<string, unknown>) as T;
}

function reviveList<T>(items: unknown): T[] {
  // Backwards compatibility for paginated responses { data: T[], total: ... }
  const arr = (items && typeof items === 'object' && 'data' in items && Array.isArray((items as any).data))
    ? (items as any).data
    : Array.isArray(items) ? items : [];
  return arr.map((i: any) => reviveItem<T>(i));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function login(email: string, password: string): Promise<User> {
  const data = await post<{ user: unknown }>("/auth/login", {
    email,
    password,
  });
  return reviveItem<User>(data.user);
}

async function logoutApi(): Promise<void> {
  await post("/auth/logout", {});
}

async function getMe(): Promise<User> {
  const data = await get<unknown>("/auth/me");
  return reviveItem<User>(data);
}

// Inject auth fns into the Zustand store so the store can call the API
// without creating a circular dependency.
injectAuthActions(login, logoutApi, getMe);

// ─── Public ApiClient object — same interface as MockAPI ──────────────────────
export const ApiClient = {
  // ── Dashboard ──
  getDashboardStats: () => get<DashboardStats>("/dashboard/stats"),
  getAnalytics: (params?: { timeRange?: string; branchId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.timeRange) searchParams.set("timeRange", params.timeRange);
    if (params?.branchId) searchParams.set("branchId", params.branchId);
    const queryString = searchParams.toString();
    return get<unknown>(
      `/dashboard/analytics${queryString ? `?${queryString}` : ""}`,
      { skipBranchScope: true }
    );
  },

  // ── Leads ──
  getLeads: () => get<Lead[]>("/leads").then(reviveList<Lead>),

  getLead: (id: string) => get<unknown>(`/leads/${id}`).then(reviveItem<Lead>),

  createLead: (values: LeadFormValues) =>
    post<unknown>("/leads", values).then(reviveItem<Lead>),

  updateLead: (id: string, data: Partial<Lead> | LeadFormValues) =>
    patch<unknown>(`/leads/${id}`, data).then(reviveItem<Lead>),

  convertLead: (
    id: string,
    bookingData: Omit<CreateBookingInput, "customerId" | "leadId">,
  ) =>
    post<unknown>(`/leads/${id}/convert`, bookingData).then(
      reviveItem<Booking>,
    ),

  addLeadActivity: (
    leadId: string,
    activity: Omit<LeadActivity, "id" | "leadId" | "createdAt"> & {
      createdAt?: Date;
    },
  ) =>
    post<unknown>(`/leads/${leadId}/activities`, activity).then(
      reviveItem<LeadActivity>,
    ),

  deleteLead: (id: string) => del<{ deleted: boolean }>(`/leads/${id}`),

  // ── Customers ──
  getCustomers: () => get<unknown[]>("/customers").then(reviveList<Customer>),

  getCustomer: (id: string) =>
    get<unknown>(`/customers/${id}`).then(reviveItem<Customer>),

  createCustomer: (values: CustomerFormValues) =>
    post<unknown>("/customers", values).then(reviveItem<Customer>),

  updateCustomer: (id: string, values: CustomerFormValues) =>
    patch<unknown>(`/customers/${id}`, values).then(reviveItem<Customer>),

  deleteCustomer: (id: string) => del<{ deleted: boolean }>(`/customers/${id}`),

  findOrCreateCustomerFromLead: (lead: Lead) =>
    post<unknown>(`/customers/from-lead/${lead.id}`, {}).then(
      reviveItem<Customer>,
    ),

  getCustomerNotes: (customerId: string) =>
    get<unknown[]>(`/customers/${customerId}/notes`).then(
      reviveList<CustomerNote>,
    ),

  createCustomerNote: (customerId: string, note: string) =>
    post<unknown>(`/customers/${customerId}/notes`, { note }).then(
      reviveItem<CustomerNote>,
    ),

  deleteCustomerNote: (id: string) => del<boolean>(`/customers/notes/${id}`),

  getCustomerDocuments: (customerId: string) =>
    get<unknown[]>(`/customers/${customerId}/documents`).then(
      reviveList<CustomerDocument>,
    ),

  createCustomerDocument: (
    customerId: string,
    doc: Omit<
      CustomerDocument,
      "id" | "customerId" | "uploadedBy" | "createdAt" | "updatedAt"
    >,
  ) =>
    post<unknown>(`/customers/${customerId}/documents`, doc).then(
      reviveItem<CustomerDocument>,
    ),

  deleteCustomerDocument: (id: string) =>
    del<boolean>(`/customers/documents/${id}`),

  // ── Bookings ──
  getBookings: () => get<unknown[]>("/bookings").then(reviveList<Booking>),

  getBooking: (id: string) =>
    get<unknown>(`/bookings/${id}`).then(reviveItem<Booking>),

  createBooking: (input: CreateBookingInput) =>
    post<unknown>("/bookings", input).then(reviveItem<Booking>),

  createBookingFromForm: (values: BookingFormValues) =>
    post<unknown>("/bookings", {
      customerId: values.customerId,
      supplierId: values.supplierId,
      airline: values.airline,
      departureCity: values.departureCity,
      arrivalCity: values.arrivalCity,
      departureDate:
        values.departureDate instanceof Date
          ? values.departureDate.toISOString()
          : values.departureDate,
      returnDate:
        values.returnDate instanceof Date
          ? values.returnDate.toISOString()
          : values.returnDate,
      pnr: values.pnr,
      ticketNumber: values.ticketNumber,
      costPrice: values.costPrice,
      salePrice: values.salePrice,
      paymentStatus: values.paymentStatus,
      amountReceived: values.amountReceived,
      notes: values.notes,
    }).then(reviveItem<Booking>),

  updateBooking: (id: string, values: BookingFormValues) =>
    patch<unknown>(`/bookings/${id}`, {
      ...values,
      departureDate:
        values.departureDate instanceof Date
          ? values.departureDate.toISOString()
          : values.departureDate,
      returnDate:
        values.returnDate instanceof Date
          ? values.returnDate?.toISOString()
          : values.returnDate,
    }).then(reviveItem<Booking>),

  deleteBooking: (id: string) => del<{ deleted: boolean }>(`/bookings/${id}`),

  // ── Suppliers ──
  getSuppliers: () => get<unknown[]>("/suppliers").then(reviveList<Supplier>),

  getSupplier: (id: string) =>
    get<unknown>(`/suppliers/${id}`).then(reviveItem<Supplier>),

  createSupplier: (values: SupplierFormValues) =>
    post<unknown>("/suppliers", values).then(reviveItem<Supplier>),

  updateSupplier: (id: string, values: SupplierFormValues) =>
    patch<unknown>(`/suppliers/${id}`, values).then(reviveItem<Supplier>),

  recordSupplierPayment: (
    id: string,
    data: { amount: number; method: string; reference?: string },
  ) =>
    post<unknown>(`/suppliers/${id}/payments`, data).then(reviveItem<Supplier>),

  deleteSupplier: (id: string) => del<{ deleted: boolean }>(`/suppliers/${id}`),

  // ── Branches ──
  getBranches: () => get<unknown[]>("/branches", { skipBranchScope: true }).then(reviveList<Branch>),

  getBranch: (id: string) =>
    get<unknown>(`/branches/${id}`).then(reviveItem<Branch>),

  createBranch: (values: BranchFormValues) =>
    post<unknown>("/branches", values).then(reviveItem<Branch>),

  updateBranch: (id: string, values: BranchFormValues) =>
    patch<unknown>(`/branches/${id}`, values).then(reviveItem<Branch>),

  // ── Users ──
  getUsers: () => get<unknown[]>("/users").then(reviveList<User>),

  getUser: (id: string) => get<unknown>(`/users/${id}`).then(reviveItem<User>),

  createUser: (values: UserFormValues) =>
    post<unknown>("/users", values) as Promise<
      { tempPassword?: string } & User
    >,

  updateUser: (id: string, values: UserFormValues) =>
    patch<unknown>(`/users/${id}`, values).then(reviveItem<User>),

  deleteUser: (id: string) => del<{ deleted: boolean }>(`/users/${id}`),

  getAgents: () => get<unknown[]>("/users/agents").then(reviveList<User>),

  // ── Expenses ──
  getExpenses: () => get<unknown[]>("/expenses").then(reviveList<Expense>),

  getExpense: (id: string) =>
    get<unknown>(`/expenses/${id}`).then(reviveItem<Expense>),

  createExpense: (values: ExpenseFormValues) =>
    post<unknown>("/expenses", {
      ...values,
      date:
        values.date instanceof Date ? values.date.toISOString() : values.date,
    }).then(reviveItem<Expense>),

  updateExpense: (id: string, values: ExpenseFormValues) =>
    patch<unknown>(`/expenses/${id}`, {
      ...values,
      date:
        values.date instanceof Date ? values.date.toISOString() : values.date,
    }).then(reviveItem<Expense>),

  deleteExpense: (id: string) => del<{ deleted: boolean }>(`/expenses/${id}`),

  // ── Roles ──
  getRoles: () => get<unknown[]>("/roles").then(reviveList<Role>),

  createRole: (data: {
    name: string;
    description?: string;
    color: string;
    textColor: string;
    permissions?: string[];
  }) => post<unknown>("/roles", data).then(reviveItem<Role>),

  updateRolePermissions: (roleId: string, permissions: string[]) =>
    patch<unknown>(`/roles/${roleId}/permissions`, { permissions }).then(
      reviveItem<Role>,
    ),

  deleteRole: (roleId: string) => del<{ deleted: boolean }>(`/roles/${roleId}`),

  // ── Receipts ──
  getReceipts: () => get<unknown[]>("/receipts").then(reviveList<Receipt>),

  createReceipt: (data: {
    bookingId: string;
    customerId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => post<unknown>("/receipts", data).then(reviveItem<Receipt>),

  // ── Booking Documents ──
  getBookingDocuments: (bookingId: string) =>
    get<unknown[]>(`/bookings/${bookingId}/documents`).then(
      reviveList<BookingDocument>,
    ),

  createBookingDocument: (
    bookingId: string,
    doc: { name: string; url: string; type: string },
  ) =>
    post<unknown>(`/bookings/${bookingId}/documents`, doc).then(
      reviveItem<BookingDocument>,
    ),

  deleteBookingDocument: (docId: string) =>
    del<{ deleted: boolean }>(`/bookings/documents/${docId}`),

  // ── Quotations ──
  getQuotations: () =>
    get<{ items: unknown[] }>("/quotations").then((res) =>
      reviveList<Quotation>(res.items as any),
    ),

  getQuotation: (id: string) =>
    get<unknown>(`/quotations/${id}`).then((q) =>
      reviveItem<Quotation>(q as any),
    ),

  getQuotationForPrint: (id: string) =>
    get<unknown>(`/quotations/${id}/print`).then((q) =>
      reviveItem<any>(q as any),
    ),

  createQuotation: (values: QuotationFormValues) =>
    post<unknown>("/quotations", values).then((q) =>
      reviveItem<Quotation>(q as any),
    ),

  updateQuotation: (id: string, values: QuotationFormValues) =>
    patch<unknown>(`/quotations/${id}`, values).then((q) =>
      reviveItem<Quotation>(q as any),
    ),

  sendQuotation: (id: string) =>
    post<unknown>(`/quotations/${id}/send`, {}).then((q) =>
      reviveItem<Quotation>(q as any),
    ),

  convertQuotationToBooking: (id: string) =>
    post<unknown>(`/quotations/${id}/convert-to-booking`, {}).then((b) =>
      reviveItem<Booking>(b as any),
    ),

  getQuotationVersions: (id: string) =>
    get<unknown[]>(`/quotations/${id}/versions`).then((v) =>
      reviveList<QuotationVersion>(v as any),
    ),

  // ── Templates ──
  getTemplates: (type?: TemplateType) =>
    get<unknown[]>(type ? `/templates?type=${type}` : "/templates").then((res) =>
      reviveList<Template>(res as any),
    ),

  createTemplate: (payload: CreateTemplatePayload) =>
    post<unknown>("/templates", payload).then((res) =>
      reviveItem<Template>(res as any),
    ),

  updateTemplate: (id: string, payload: UpdateTemplatePayload) =>
    patch<unknown>(`/templates/${id}`, payload).then((res) =>
      reviveItem<Template>(res as any),
    ),

  deleteTemplate: (id: string) => del<{ deleted: boolean }>(`/templates/${id}`),

  // ── Auth helpers (exposed for login page) ──
  login,
  logout: logoutApi,
  getMe,

  // ── Settings ──
  getSettings: () => get<unknown>("/settings").then(reviveItem<any>),
  updateSettings: (data: any) => patch<unknown>("/settings", data).then(reviveItem<any>),

  // ── Notifications ──
  getNotifications: (page = 1, limit = 20) => get<any>(`/notifications?page=${page}&limit=${limit}`).then(res => ({
    ...res, data: reviveList<any>(res.data || res)
  })),
  markNotificationRead: (id: string) => patch<any>(`/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => patch<any>("/notifications/read-all", {}),
  deleteNotification: (id: string) => del<any>(`/notifications/${id}`),

  // ── Reports & Ledger ──
  getCustomerLedger: (id: string) => get<any>(`/customers/${id}/ledger`),
  getSupplierStatement: (id: string) => get<any>(`/suppliers/${id}/statement`),

  // ── Invoices ──
  getInvoices: () => get<any>("/invoices").then(res => reviveList<any>(res.data || res)),
  getInvoice: (id: string) => get<any>(`/invoices/${id}`),
  generateInvoiceFromBooking: (bookingId: string) => post<any>(`/invoices/from-booking/${bookingId}`, {}),
  markInvoicePaid: (id: string) => post<any>(`/invoices/${id}/mark-paid`, {}),
};
