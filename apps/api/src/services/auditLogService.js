const prisma = require("../utils/prisma");

async function logAudit({ workspaceId, actorId, action, entityType, entityId, metadata }) {
  return prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: actorId || null,
      action,
      entityType,
      entityId,
      metadata: metadata || null
    }
  });
}

module.exports = { logAudit };
