const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(slug, workspaceId) {
  const existing = await prisma.workspace.findUnique({
    where: { slug }
  });

  if (existing && existing.id !== workspaceId) {
    throw new HttpError(409, "Workspace slug already in use");
  }
}

async function createWorkspace({ userId, name, slug, description }) {
  if (!name || !name.trim()) {
    throw new HttpError(400, "Workspace name is required");
  }

  const normalizedSlug = slug ? slugify(slug) : slugify(name);
  if (!normalizedSlug) {
    throw new HttpError(400, "Workspace slug is required");
  }

  await ensureUniqueSlug(normalizedSlug);

  const workspace = await prisma.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        description: description || null,
        members: {
          create: {
            userId,
            role: "ADMIN"
          }
        }
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: created.id }
    });

    return created;
  });

  return workspace;
}

async function updateWorkspace({ workspaceId, name, slug, description, actorId }) {
  const updates = {};

  if (name !== undefined) {
    if (!name || !name.trim()) {
      throw new HttpError(400, "Workspace name cannot be empty");
    }
    updates.name = name.trim();
  }

  if (description !== undefined) {
    updates.description = description || null;
  }

  if (slug !== undefined) {
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
      throw new HttpError(400, "Workspace slug cannot be empty");
    }

    await ensureUniqueSlug(normalizedSlug, workspaceId);
    updates.slug = normalizedSlug;
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No workspace updates provided");
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: updates
  });

  await logAudit({
    workspaceId,
    actorId: actorId || null,
    action: "workspace.updated",
    entityType: "workspace",
    entityId: workspaceId,
    metadata: updates
  });

  eventBus.emit("workspace.updated", { workspaceId, workspace, updates });

  return workspace;
}

async function switchWorkspace({ userId, workspaceId }) {
  await prisma.user.update({
    where: { id: userId },
    data: { activeWorkspaceId: workspaceId }
  });
}

async function postCreateWorkspace({ workspace, actorId }) {
  await logAudit({
    workspaceId: workspace.id,
    actorId,
    action: "workspace.created",
    entityType: "workspace",
    entityId: workspace.id,
    metadata: { name: workspace.name, slug: workspace.slug }
  });

  eventBus.emit("workspace.created", { workspaceId: workspace.id, workspace });
}

module.exports = {
  createWorkspace,
  updateWorkspace,
  switchWorkspace,
  postCreateWorkspace
};
