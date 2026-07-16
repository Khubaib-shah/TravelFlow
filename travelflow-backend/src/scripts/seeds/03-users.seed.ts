import { User } from "../../models";
import { Types } from "mongoose";

export async function seedUsers(
  agencyId: Types.ObjectId,
  branches: any[],
  _roles: any[]
) {
  console.log("Seeding Users...");

  const getBranch = (code: string) => branches.find((b) => b.code === code)?._id;

  const usersData = [
    {
      firstName: "Trip",
      lastName: "Owner",
      email: "owner@triptrails.pk",
      password: "the",
      phone: "+92 300 1111111",
      role: "admin",
      status: "active",
      branchId: getBranch("KHI-HQ"),
    },
    {
      firstName: "Muhammad",
      lastName: "Ahmed",
      email: "manager.khi@triptrails.pk",
      password: "Password123!",
      phone: "+92 300 2222222",
      role: "manager",
      status: "active",
      branchId: getBranch("KHI-HQ"),
    },
    {
      firstName: "Ali",
      lastName: "Raza",
      email: "manager.lhr@triptrails.pk",
      password: "Password123!",
      phone: "+92 321 3333333",
      role: "manager",
      status: "active",
      branchId: getBranch("LHR-BR"),
    },
    {
      firstName: "Usman",
      lastName: "Khan",
      email: "agent1@triptrails.pk",
      password: "Password123!",
      phone: "+92 333 4444444",
      role: "agent",
      status: "active",
      branchId: getBranch("KHI-HQ"),
    },
    {
      firstName: "Hamza",
      lastName: "Ali",
      email: "agent2@triptrails.pk",
      password: "Password123!",
      phone: "+92 345 5555555",
      role: "agent",
      status: "active",
      branchId: getBranch("LHR-BR"),
    },
    {
      firstName: "Bilal",
      lastName: "Ahmed",
      email: "accounts@triptrails.pk",
      password: "Password123!",
      phone: "+92 300 6666666",
      role: "accountant",
      status: "active",
      branchId: getBranch("KHI-HQ"),
    },
    {
      firstName: "Fatima",
      lastName: "Noor",
      email: "support@triptrails.pk",
      password: "Password123!",
      phone: "+92 321 7777777",
      role: "support",
      status: "active",
      branchId: getBranch("KHI-HQ"),
    },
    {
      firstName: "Ayesha",
      lastName: "Siddiqui",
      email: "ayesha@triptrails.pk",
      password: "Password123!",
      phone: "+92 333 8888888",
      role: "agent",
      status: "active",
      branchId: getBranch("ISB-BR"),
    },
    {
      firstName: "Hina",
      lastName: "Khan",
      email: "hina@triptrails.pk",
      password: "Password123!",
      phone: "+92 345 9999999",
      role: "agent",
      status: "active",
      branchId: getBranch("PEW-BR"),
    },
    {
      firstName: "Sana",
      lastName: "Malik",
      email: "sana@triptrails.pk",
      password: "Password123!",
      phone: "+92 300 1231231",
      role: "agent",
      status: "inactive",
      branchId: getBranch("MUX-BR"),
    },
    {
      firstName: "Zain",
      lastName: "Abbas",
      email: "zain@triptrails.pk",
      password: "Password123!",
      phone: "+92 321 4564564",
      role: "agent",
      status: "active",
      branchId: getBranch("HYD-BR"),
    },
  ];

  const users = [];
  // Using sequential creation because of bcrypt hashing pre-hook in User model
  for (const ud of usersData) {
    const user = new User({ ...ud, agencyId });
    await user.save();
    users.push(user);
  }

  return users;
}
