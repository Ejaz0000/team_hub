const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const eventBus = require("../realtime/eventBus");

const MENTION_REGEX = /@([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi;

function extractMentionEmails(text) {
  if (!text) {
    return [];
  }

  const emails = new Set();
  MENTION_REGEX.lastIndex = 0;
  let match = MENTION_REGEX.exec(text);
  while (match) {
    emails.add(match[1].toLowerCase());
    match = MENTION_REGEX.exec(text);
  }

  return Array.from(emails);
}

async function createNotification({
  userId,
  workspaceId,
  actorId,
  title,
  body,
  entityType,
  entityId
}) {
  if (!userId || !title) {
    throw new HttpError(400, "Notification data is incomplete");
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      workspaceId: workspaceId || null,
      actorId: actorId || null,
      title,
      body: body || null,
      entityType: entityType || null,
      entityId: entityId || null
    }
  });

  eventBus.emit("notification.created", {
    userId,
    workspaceId,
    notification
  });

  return notification;
}

async function resolveMentionRecipients({ workspaceId, actorId, text }) {
  const emails = extractMentionEmails(text);
  if (!emails.length) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true }
  });

  const userIds = users.map((user) => user.id).filter((id) => id !== actorId);
  if (!userIds.length) {
    return [];
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { in: userIds } },
    select: { userId: true }
  });

  return members.map((member) => member.userId);
}

async function notifyMentions({
  workspaceId,
  actorId,
  text,
  entityType,
  entityId,
  title,
  excludeUserIds
}) {
  const recipients = await resolveMentionRecipients({ workspaceId, actorId, text });
  if (!recipients.length) {
    return [];
  }

  const excluded = new Set(excludeUserIds || []);

  const notifications = [];
  for (const userId of recipients) {
    if (excluded.has(userId)) {
      continue;
    }
    const notification = await createNotification({
      userId,
      workspaceId,
      actorId,
      title,
      body: text ? text.slice(0, 160) : null,
      entityType,
      entityId
    });
    notifications.push(notification);
  }

  return notifications;
}

async function notifyComment({
  workspaceId,
  actorId,
  announcementId,
  announcementTitle,
  announcementCreatorId,
  commentId,
  body
}) {
  const notifications = [];
  const excluded = new Set();

  if (announcementCreatorId && announcementCreatorId !== actorId) {
    const notification = await createNotification({
      userId: announcementCreatorId,
      workspaceId,
      actorId,
      title: "New comment",
      body: announcementTitle || body,
      entityType: "comment",
      entityId: commentId
    });
    notifications.push(notification);
    excluded.add(announcementCreatorId);
  }

  const mentionNotifications = await notifyMentions({
    workspaceId,
    actorId,
    text: body,
    entityType: "comment",
    entityId: commentId,
    title: "You were mentioned",
    excludeUserIds: Array.from(excluded)
  });

  return notifications.concat(mentionNotifications);
}

async function notifyInvite({ workspaceId, actorId, userId, workspaceName }) {
  return createNotification({
    userId,
    workspaceId,
    actorId,
    title: "Workspace invite",
    body: workspaceName || "You were added to a workspace",
    entityType: "workspace",
    entityId: workspaceId
  });
}

module.exports = {
  createNotification,
  notifyMentions,
  notifyComment,
  notifyInvite
};
