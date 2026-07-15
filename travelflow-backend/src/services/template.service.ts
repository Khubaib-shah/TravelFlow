import mongoose from "mongoose";
import { Template, TemplateType } from "../models/Template.model";
import { ApiError } from "../utils/ApiError";
import { toJSON, toJSONList } from "../utils/serialize";

type TenantContext = {
  agencyId: string;
};

export async function getTemplates(
  { agencyId }: TenantContext,
  type?: TemplateType
) {
  const query: any = { agencyId, isDeleted: false };
  if (type) {
    query.type = type;
  }
  const templates = await Template.find(query).sort({ name: 1 });
  return toJSONList(templates);
}

export async function createTemplate({
  agencyId,
  name,
  type,
  content,
}: TenantContext & { name: string; type: TemplateType; content: string }) {
  if (!name || !type || !content) {
    throw ApiError.badRequest("Name, type, and content are required");
  }

  const template = await Template.create({
    agencyId,
    name,
    type,
    content,
    isDeleted: false,
  });

  return toJSON(template);
}

export async function updateTemplate({
  agencyId,
  templateId,
  name,
  type,
  content,
}: TenantContext & {
  templateId: string;
  name?: string;
  type?: TemplateType;
  content?: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw ApiError.badRequest("Invalid template id");
  }

  const template = await Template.findOne({
    _id: templateId,
    agencyId,
    isDeleted: false,
  });

  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  if (name !== undefined) template.name = name;
  if (type !== undefined) template.type = type;
  if (content !== undefined) template.content = content;

  await template.save();
  return toJSON(template);
}

export async function deleteTemplate({
  agencyId,
  templateId,
}: TenantContext & { templateId: string }) {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw ApiError.badRequest("Invalid template id");
  }

  const template = await Template.findOneAndUpdate(
    { _id: templateId, agencyId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  return { deleted: true };
}
