import { Supplier } from "@/types";

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    agencyId: "ag-1",
    name: "Emirates Group",
    category: "airline",
    contactPerson: "Ahmed Ali",
    email: "b2b@emirates.com",
    phone: "+971 4 123 4567",
    city: "Dubai",
    country: "UAE",
    balance: 150000,
    status: "active",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "sup-2",
    agencyId: "ag-1",
    name: "Global Consolidators",
    category: "consolidator",
    contactPerson: "Kamran Shah",
    email: "kamran@globalcon.pk",
    phone: "+92 21 111 222 333",
    city: "Karachi",
    country: "Pakistan",
    balance: 450000,
    status: "active",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2024-02-20"),
  }
];
