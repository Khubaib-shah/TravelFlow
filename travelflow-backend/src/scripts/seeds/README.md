# Trip Trails Demo Seed Generator

This tool generates a comprehensive, production-quality demo dataset for the TravelFlow ERP. It populates all modules with realistic data mimicking a Pakistani travel agency (Trip Trails) that has been operating for the last four months.

## Prerequisites

- Node.js installed.
- MongoDB connection string configured in the `.env` file at the root of the backend directory (`travelflow-backend/.env`).

## Warning
**⚠️ DESTRUCTIVE ACTION:** Running the seed script will **WIPE AND DROP** your existing local database before generating the new data. Do not run this on a production database.

## Execution Instructions

To generate the dataset, run the following command from the root of the `travelflow-backend` directory:

```bash
npx ts-node src/scripts/seedDemo.ts
```

This master script will systematically execute 10 modular seed files:
1. `01-agency.seed.ts` (Agency & Branches)
2. `02-roles.seed.ts` (RBAC)
3. `03-users.seed.ts` (Employees)
4. `04-suppliers.seed.ts` (Airlines & Hotels)
5. `05-customers.seed.ts` (Clients)
6. `06-leads.seed.ts` (CRM Leads)
7. `07-quotations.seed.ts` (Quotations & Items)
8. `08-bookings.seed.ts` (Bookings)
9. `09-finance.seed.ts` (Invoices, Receipts, Expenses)
10. `10-activity.seed.ts` (Activity Logs & Notifications)

## Demo Login Credentials

You can use the following accounts to test the Role-Based Access Control (RBAC):

| Role | Name | Email | Password | Assigned Branch |
|------|------|-------|----------|----------------|
| **Agency Owner / Admin** | Trip Owner | `owner@triptrails.pk` | `Password123!` | Karachi (HQ) |
| **Branch Manager** | Muhammad Ahmed | `manager.khi@triptrails.pk` | `Password123!` | Karachi (HQ) |
| **Branch Manager** | Ali Raza | `manager.lhr@triptrails.pk` | `Password123!` | Lahore |
| **Agent** | Usman Khan | `agent1@triptrails.pk` | `Password123!` | Karachi (HQ) |
| **Agent** | Hamza Ali | `agent2@triptrails.pk` | `Password123!` | Lahore |
| **Accountant** | Bilal Ahmed | `accounts@triptrails.pk` | `Password123!` | Karachi (HQ) |
| **Support** | Fatima Noor | `support@triptrails.pk` | `Password123!` | Karachi (HQ) |
| **Agent** | Ayesha Siddiqui | `ayesha@triptrails.pk` | `Password123!` | Islamabad |

*(Note: There are 11 total seeded users, including users across Peshawar, Multan, and Hyderabad).*
