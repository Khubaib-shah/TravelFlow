import { Agency, Branch } from "../../models";
import { Types } from "mongoose";

export async function seedAgencyAndBranches() {
  console.log("Seeding Agency and Branches...");

  const agency = await Agency.create({
    _id: new Types.ObjectId(),
    name: "Trip Trails",
    slug: "triptrails",
    code: "TT",
    contactEmail: "info@triptrails.pk",
    contactPhone: "+92 21 111 222 333",
    address: "Shahrah-e-Faisal, Block 6 PECHS",
    city: "Karachi",
    country: "Pakistan",
    currency: "PKR",
    registrationNo: "SECP-TT-890234",
    notifications: {
      emailAlerts: true,
      smsAlerts: true,
      dailyReports: true,
    },
    status: "active",
  });

  const branchData = [
    { name: "Karachi Head Office", code: "KHI-HQ", city: "Karachi", address: "Shahrah-e-Faisal, Block 6 PECHS", phone: "+92 21 111 222 333", isHeadOffice: true },
    { name: "Lahore Branch", code: "LHR-BR", city: "Lahore", address: "MM Alam Road, Gulberg III", phone: "+92 42 35789123", isHeadOffice: false },
    { name: "Islamabad Branch", code: "ISB-BR", city: "Islamabad", address: "Jinnah Avenue, Blue Area", phone: "+92 51 2821234", isHeadOffice: false },
    { name: "Peshawar Branch", code: "PEW-BR", city: "Peshawar", address: "University Road, Tehkal", phone: "+92 91 5845678", isHeadOffice: false },
    { name: "Multan Branch", code: "MUX-BR", city: "Multan", address: "Abdali Road, Cantt", phone: "+92 61 4512345", isHeadOffice: false },
    { name: "Hyderabad Branch", code: "HYD-BR", city: "Hyderabad", address: "Thandi Sarak", phone: "+92 22 2781234", isHeadOffice: false },
  ];

  const branches = await Branch.insertMany(
    branchData.map((b) => ({ ...b, agencyId: agency._id }))
  );

  return { agency, branches };
}
