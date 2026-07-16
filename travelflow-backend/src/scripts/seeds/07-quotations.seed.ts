import { Quotation, QuotationItem } from "../../models";
import { Types } from "mongoose";
import { generateRef, getRandomDate, getRandomItem, getRandomInt } from "./utils";

export async function seedQuotations(
  agencyId: Types.ObjectId,
  branches: any[],
  users: any[],
  customers: any[],
  leads: any[]
) {
  console.log("Seeding Quotations...");

  const agents = users.filter((u) => u.role === "agent" || u.role === "manager");
  const travelTypes = ["umrah", "holiday_package", "flight", "visa", "hotel", "custom"];
  const destinations = ["Dubai", "Turkey", "Thailand", "Malaysia", "Saudi Arabia", "Skardu", "Hunza"];
  const statuses = ["draft", "sent", "negotiation", "accepted", "rejected", "expired", "cancelled"];

  const quotationsData = [];
  
  for (let i = 1; i <= 100; i++) {
    const branch = getRandomItem(branches);
    const consultant = getRandomItem(agents.filter(a => String(a.branchId) === String(branch._id))) || getRandomItem(agents);
    const isCustomer = Math.random() > 0.5;
    
    const adults = getRandomInt(1, 4);
    const children = getRandomInt(0, 3);
    const infants = getRandomInt(0, 1);
    
    quotationsData.push({
      _id: new Types.ObjectId(),
      agencyId,
      branchId: branch._id,
      consultantId: consultant._id,
      quotationNumber: generateRef("QT", 6),
      title: `${getRandomItem(["Luxury", "Standard", "Economy", "Family"])} ${getRandomItem(destinations)} Package`,
      customerId: isCustomer ? getRandomItem(customers)._id : undefined,
      leadId: !isCustomer ? getRandomItem(leads)._id : undefined,
      travelType: getRandomItem(travelTypes),
      destination: getRandomItem(destinations),
      departureDate: getRandomDate(30, false),
      adults,
      children,
      infants,
      currency: "PKR",
      status: getRandomItem(statuses),
      createdAt: getRandomDate(120),
    });
  }

  const quotations = await Quotation.insertMany(quotationsData);

  // Generate Quotation Items
  const itemsData = [];
  for (const q of quotations) {
    let subtotal = 0;
    
    const numItems = getRandomInt(1, 4);
    for (let j = 0; j < numItems; j++) {
      const quantity = (q.adults as number) + (q.children as number);
      const costPrice = getRandomInt(50000, 150000);
      const sellingPrice = costPrice + getRandomInt(5000, 20000);
      
      subtotal += quantity * sellingPrice;

      itemsData.push({
        agencyId,
        quotationId: q._id,
        serviceCategory: getRandomItem(["Flight", "Hotel", "Visa", "Transport", "Tour"]),
        title: `Service ${j + 1}`,
        quantity,
        unit: "Person",
        costPrice,
        sellingPrice,
        total: quantity * sellingPrice,
        sortOrder: j,
      });
    }

    // Update quotation totals
    const discount = getRandomInt(0, 10000);
    const taxTotal = Math.floor((subtotal - discount) * 0.05); // 5% tax
    const total = subtotal - discount + taxTotal;
    const estimatedProfit = Math.floor(subtotal * 0.1); // approx 10% profit
    
    await Quotation.findByIdAndUpdate(q._id, {
      subtotal,
      discount,
      taxTotal,
      total,
      estimatedProfit
    });
  }

  await QuotationItem.insertMany(itemsData);

  return quotations;
}
