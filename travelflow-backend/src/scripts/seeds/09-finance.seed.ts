import { Invoice, Receipt, Expense, Booking } from "../../models";
import { Types } from "mongoose";
import { generateRef, getRandomDate, getRandomItem, getRandomInt } from "./utils";

export async function seedFinance(
  agencyId: Types.ObjectId,
  branches: any[],
  users: any[],
  bookings: any[]
) {
  console.log("Seeding Finance...");


  const receiptsData = [];
  const expensesData = [];
  
  const paymentMethods = ["Cash", "Bank Transfer", "JazzCash", "EasyPaisa", "Credit Card"];
  const expenseCategories = ["Office Rent", "Electricity", "Internet", "Fuel", "Tea & Snacks", "Stationery", "Marketing", "Salary", "Maintenance", "Courier", "Miscellaneous"];

  // 1. Generate Invoices and Receipts for Bookings
  for (const booking of bookings) {
    const isPaid = Math.random() > 0.4;
    const isPartial = !isPaid && Math.random() > 0.5;
    
    // Create Invoice
    const invoiceSubtotal = booking.salePrice;
    const invoiceTax = Math.floor(invoiceSubtotal * 0.05); // 5% tax
    const invoiceTotal = invoiceSubtotal + invoiceTax;
    
    let invoiceStatus = "draft";
    if (isPaid) invoiceStatus = "paid";
    else if (isPartial) invoiceStatus = "sent";
    else if (Math.random() > 0.8) invoiceStatus = "overdue";
    else invoiceStatus = "sent";

    const invoice = new Invoice({
      agencyId,
      branchId: booking.branchId,
      invoiceRef: generateRef("INV", 6),
      bookingId: booking._id,
      customerId: booking.customerId,
      items: [{
        description: `Flight Booking to ${booking.arrivalCity} (${booking.airline})`,
        quantity: 1,
        unitPrice: invoiceSubtotal,
        amount: invoiceSubtotal,
      }],
      subtotal: invoiceSubtotal,
      tax: invoiceTax,
      total: invoiceTotal,
      status: invoiceStatus,
      dueDate: getRandomDate(30, false),
      createdAt: booking.createdAt,
    });
    
    await invoice.save();

    // Create Receipts and Update Booking Payment Status
    let amountReceived = 0;
    
    if (isPaid || isPartial) {
      const numPayments = isPaid ? getRandomInt(1, 2) : 1;
      let remainingToPay = isPaid ? invoiceTotal : Math.floor(invoiceTotal * (getRandomInt(20, 50) / 100)); // partial payment 20-50%
      
      for (let j = 0; j < numPayments; j++) {
        const amount = j === numPayments - 1 ? remainingToPay : Math.floor(remainingToPay / 2);
        remainingToPay -= amount;
        amountReceived += amount;

        receiptsData.push({
          agencyId,
          branchId: booking.branchId,
          receiptRef: generateRef("RCT", 6),
          bookingId: booking._id,
          customerId: booking.customerId,
          amount,
          paymentMethod: getRandomItem(paymentMethods),
          date: new Date(booking.createdAt.getTime() + getRandomInt(0, 86400000 * 5)), // paid within 5 days of booking
        });
      }
    }

    // Update Booking status based on payments
    let paymentStatus = "unpaid";
    if (amountReceived >= invoiceTotal) paymentStatus = "paid";
    else if (amountReceived > 0) paymentStatus = "partial";
    
    await Booking.findByIdAndUpdate(booking._id, {
      paymentStatus,
      amountReceived,
      balance: booking.salePrice - amountReceived // Wait, invoice has tax, but booking balance relies on salePrice. We'll stick to model logic.
    });
  }

  if (receiptsData.length > 0) {
    await Receipt.insertMany(receiptsData);
  }

  // 2. Generate Expenses
  for (let i = 0; i < 80; i++) {
    const branch = getRandomItem(branches);
    const user = getRandomItem(users.filter(u => String(u.branchId) === String(branch._id))) || getRandomItem(users);
    
    expensesData.push({
      agencyId,
      branchId: branch._id,
      expenseRef: generateRef("EXP", 6),
      title: `${getRandomItem(expenseCategories)} Expense`,
      category: getRandomItem(expenseCategories),
      amount: getRandomInt(2000, 50000),
      date: getRandomDate(120),
      paidTo: `Vendor ${generateRef("", 3)}`,
      paymentMethod: getRandomItem(["Cash", "Bank Transfer"]),
      recordedById: user._id,
      status: getRandomItem(["approved", "approved", "approved", "pending", "rejected"]),
    });
  }

  const expenses = await Expense.insertMany(expensesData);

  return { invoices: [], receipts: [], expenses }; // Just return structure
}
