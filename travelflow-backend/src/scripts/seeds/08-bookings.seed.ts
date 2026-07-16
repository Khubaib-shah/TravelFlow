import { Booking } from "../../models";
import { Types } from "mongoose";
import { generateRef, getRandomDate, getRandomItem, getRandomInt } from "./utils";

export async function seedBookings(
  agencyId: Types.ObjectId,
  branches: any[],
  users: any[],
  customers: any[],
  suppliers: any[],
  leads: any[]
) {
  console.log("Seeding Bookings...");

  const agents = users.filter((u) => u.role === "agent" || u.role === "manager");
  const airlines = suppliers.filter(s => s.category === "airline");
  const destinations = ["Dubai", "Istanbul", "Jeddah", "Makkah", "Kuala Lumpur", "Bangkok", "Skardu"];
  const statuses = ["pending", "confirmed", "completed", "cancelled", "ticket_issued", "visa_processing"];

  const bookingsData = [];
  
  for (let i = 1; i <= 150; i++) {
    const branch = getRandomItem(branches);
    const agent = getRandomItem(agents.filter(a => String(a.branchId) === String(branch._id))) || getRandomItem(agents);
    const customer = getRandomItem(customers);
    const supplier = airlines.length > 0 ? getRandomItem(airlines) : getRandomItem(suppliers);
    const isLeadConverted = Math.random() > 0.7;

    const costPrice = getRandomInt(40000, 200000);
    const salePrice = costPrice + getRandomInt(5000, 30000);
    const profit = salePrice - costPrice;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

    bookingsData.push({
      agencyId,
      branchId: branch._id,
      agentId: agent._id,
      customerId: customer._id,
      supplierId: supplier._id,
      leadId: isLeadConverted ? getRandomItem(leads)._id : undefined,
      bookingRef: generateRef("BKG", 6),
      pnr: generateRef("", 6).toUpperCase(),
      ticketNumber: `775-${getRandomInt(1000000000, 9999999999)}`,
      airline: supplier.name,
      departureCity: getRandomItem(["Karachi", "Lahore", "Islamabad"]),
      arrivalCity: getRandomItem(destinations),
      departureDate: getRandomDate(60, false), // mix of past and future
      costPrice,
      salePrice,
      profit,
      profitMargin,
      bookingStatus: getRandomItem(statuses),
      paymentStatus: "unpaid", // Will be updated in finance seed
      amountReceived: 0,
      createdAt: getRandomDate(120),
    });
  }

  const bookings = [];
  for (const bData of bookingsData) {
    const b = new Booking(bData);
    await b.save();
    bookings.push(b);
  }

  return bookings;
}
