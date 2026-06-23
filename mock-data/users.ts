import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    agencyId: "ag-1",
    branchId: "br-1",
    firstName: "Ahmad",
    lastName: "Khan",
    email: "ahmad@agency.com",
    role: "admin",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-2",
    agencyId: "ag-1",
    branchId: "br-2",
    firstName: "Sara",
    lastName: "Ali",
    email: "sara@agency.com",
    role: "agent",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-3",
    agencyId: "ag-1",
    branchId: "br-1",
    firstName: "Usman",
    lastName: "Tariq",
    email: "usman@agency.com",
    role: "manager",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
