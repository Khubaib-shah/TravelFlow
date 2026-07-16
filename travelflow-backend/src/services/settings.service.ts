import { Agency } from "../models/Agency.model";
import { ApiError } from "../utils/ApiError";

export async function getSettings(agencyId: string) {
  const agency = await Agency.findById(agencyId);
  if (!agency) throw ApiError.notFound("Agency");
  return agency;
}

export async function updateSettings(agencyId: string, data: any) {
  const agency = await Agency.findByIdAndUpdate(agencyId, { $set: data }, { new: true });
  if (!agency) throw ApiError.notFound("Agency");
  return agency;
}
