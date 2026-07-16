import { Supplier } from "../../models";
import { Types } from "mongoose";

export async function seedSuppliers(agencyId: Types.ObjectId) {
  console.log("Seeding Suppliers...");

  const supplierData = [
    // Airlines
    { name: "PIA", category: "airline", city: "Karachi", country: "Pakistan" },
    { name: "Airblue", category: "airline", city: "Islamabad", country: "Pakistan" },
    { name: "Serene Air", category: "airline", city: "Islamabad", country: "Pakistan" },
    { name: "Fly Jinnah", category: "airline", city: "Karachi", country: "Pakistan" },
    { name: "AirSial", category: "airline", city: "Sialkot", country: "Pakistan" },
    { name: "Emirates", category: "airline", city: "Dubai", country: "UAE" },
    { name: "Qatar Airways", category: "airline", city: "Doha", country: "Qatar" },
    { name: "Turkish Airlines", category: "airline", city: "Istanbul", country: "Turkey" },
    { name: "Etihad Airways", category: "airline", city: "Abu Dhabi", country: "UAE" },
    { name: "Saudi Airlines", category: "airline", city: "Jeddah", country: "Saudi Arabia" },
    { name: "FlyDubai", category: "airline", city: "Dubai", country: "UAE" },
    { name: "Air Arabia", category: "airline", city: "Sharjah", country: "UAE" },

    // Visa Partners
    { name: "Dubai Visa Processing Center", category: "visa", city: "Dubai", country: "UAE" },
    { name: "Gerry's Visa", category: "visa", city: "Karachi", country: "Pakistan" },
    { name: "VFS Global", category: "visa", city: "Islamabad", country: "Pakistan" },
    { name: "Umrah Visa Services", category: "visa", city: "Makkah", country: "Saudi Arabia" },

    // Transport
    { name: "Daewoo Express", category: "transport", city: "Lahore", country: "Pakistan" },
    { name: "Faisal Movers", category: "transport", city: "Multan", country: "Pakistan" },

    // Hotels
    { name: "Pearl Continental", category: "hotel", city: "Karachi", country: "Pakistan" },
    { name: "Marriott Hotel", category: "hotel", city: "Islamabad", country: "Pakistan" },
    { name: "Serena Hotel", category: "hotel", city: "Islamabad", country: "Pakistan" },
    { name: "Avari Towers", category: "hotel", city: "Karachi", country: "Pakistan" },
    { name: "Makkah Clock Royal Tower", category: "hotel", city: "Makkah", country: "Saudi Arabia" },
    { name: "Pullman Zamzam Makkah", category: "hotel", city: "Makkah", country: "Saudi Arabia" },
    { name: "Anwar Al Madinah", category: "hotel", city: "Madinah", country: "Saudi Arabia" },
    { name: "Atlantis The Palm", category: "hotel", city: "Dubai", country: "UAE" },
    { name: "Swissotel The Bosphorus", category: "hotel", city: "Istanbul", country: "Turkey" },
  ];

  const suppliers = await Supplier.insertMany(
    supplierData.map((s) => ({ ...s, agencyId }))
  );

  return suppliers;
}
