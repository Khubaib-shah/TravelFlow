import { Customer, CustomerNote } from "../../models";
import { Types } from "mongoose";
import { generateRef, getRandomInt } from "./utils";

export async function seedCustomers(agencyId: Types.ObjectId) {
  console.log("Seeding Customers...");

  const firstNames = ["Muhammad", "Ali", "Usman", "Ahmad", "Omar", "Hassan", "Hussain", "Tariq", "Fatima", "Ayesha", "Zainab", "Khadija", "Maryam", "Sana", "Hina", "Nida", "Amna", "Iqra"];
  const lastNames = ["Khan", "Ahmed", "Ali", "Raza", "Qureshi", "Malik", "Sheikh", "Chaudhry", "Ansari", "Shah", "Abbas", "Siddiqui"];
  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad", "Quetta", "Hyderabad", "Sialkot"];

  const customersData = [];

  // Generate 100 individuals
  for (let i = 1; i <= 100; i++) {
    const isCorporate = Math.random() > 0.85;
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    customersData.push({
      agencyId,
      customerRef: generateRef("CUST", 6),
      type: isCorporate ? "corporate" : "individual",
      firstName: fName,
      lastName: lName,
      companyName: isCorporate ? `${lName} Enterprises` : undefined,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone: `+92 3${getRandomInt(0, 4)}0 ${getRandomInt(1000000, 9999999)}`,
      whatsapp: `+92 3${getRandomInt(0, 4)}0 ${getRandomInt(1000000, 9999999)}`,
      city: city,
      country: "Pakistan",
      cnic: `42201-${getRandomInt(1000000, 9999999)}-${getRandomInt(1, 9)}`,
      passportNumber: `A${getRandomInt(10000000, 99999999)}`,
      nationality: "Pakistani",
      status: "active",
    });
  }

  const customers = await Customer.insertMany(customersData);

  // Generate some notes
  const notesData = [];
  for (const cust of customers) {
    if (Math.random() > 0.5) {
      notesData.push({
        agencyId,
        customerId: cust._id,
        note: `Customer prefers ${Math.random() > 0.5 ? 'window' : 'aisle'} seats and vegetarian meals.`,
        addedBy: "System Migration",
      });
    }
  }
  if (notesData.length > 0) {
    await CustomerNote.insertMany(notesData);
  }

  return customers;
}
