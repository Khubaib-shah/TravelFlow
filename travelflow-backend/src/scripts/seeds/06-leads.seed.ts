import { Lead, LeadActivity } from "../../models";
import { Types } from "mongoose";
import { generateRef, getRandomDate, getRandomItem, getRandomInt } from "./utils";

export async function seedLeads(
  agencyId: Types.ObjectId,
  branches: any[],
  users: any[]
) {
  console.log("Seeding Leads...");

  const agents = users.filter((u) => u.role === "agent" || u.role === "manager");
  const sources = ["Facebook Ads", "Instagram", "WhatsApp", "Website", "Google Search", "Walk-in", "Referral", "TikTok"];
  const statuses = ["new", "contacted", "follow_up", "interested", "negotiation", "converted", "lost"];
  const destinations = ["Dubai", "Turkey", "Thailand", "Malaysia", "Saudi Arabia (Umrah)", "Skardu", "Hunza", "Baku", "Singapore"];
  const names = ["Ahmad", "Sana", "Bilal", "Zainab", "Ali", "Fatima", "Hassan", "Ayesha"];

  const leadsData = [];
  
  for (let i = 1; i <= 200; i++) {
    const branch = getRandomItem(branches);
    const assignedAgent = getRandomItem(agents.filter(a => String(a.branchId) === String(branch._id))) || getRandomItem(agents);
    const status = getRandomItem(statuses);
    const source = getRandomItem(sources);
    const name = getRandomItem(names) + " " + generateRef("", 3);
    
    leadsData.push({
      agencyId,
      branchId: branch._id,
      assignedAgentId: assignedAgent._id,
      leadRef: generateRef("LD", 6),
      name,
      phone: `+92 3${getRandomInt(0, 4)}0 ${getRandomInt(1000000, 9999999)}`,
      destination: getRandomItem(destinations),
      travelDate: Math.random() > 0.5 ? getRandomDate(30, false) : undefined, // Some travel dates are in the future, some past
      adults: getRandomInt(1, 4),
      children: getRandomInt(0, 3),
      source,
      status,
      createdAt: getRandomDate(120),
      lastContactedAt: getRandomDate(30),
    });
  }

  const leads = await Lead.insertMany(leadsData);

  // Generate Lead Activities
  const activitiesData = [];
  for (const lead of leads) {
    const numActivities = getRandomInt(1, 5);
    for (let j = 0; j < numActivities; j++) {
      activitiesData.push({
        agencyId,
        leadId: lead._id,
        type: getRandomItem(["call", "email", "whatsapp", "meeting", "note"]),
        description: `Followed up with lead regarding ${lead.destination} package.`,
        outcome: getRandomItem(["interested", "not_answering", "requested_quote", "callback_later"]),
        createdBy: "System Agent",
        createdAt: getRandomDate(60),
      });
    }
  }

  await LeadActivity.insertMany(activitiesData);

  return leads;
}
