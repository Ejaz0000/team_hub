const onlineByWorkspace = new Map();

function getSet(workspaceId) {
  if (!onlineByWorkspace.has(workspaceId)) {
    onlineByWorkspace.set(workspaceId, new Set());
  }

  return onlineByWorkspace.get(workspaceId);
}

function addUser(workspaceId, userId) {
  const set = getSet(workspaceId);
  set.add(userId);
  return Array.from(set);
}

function removeUser(workspaceId, userId) {
  const set = onlineByWorkspace.get(workspaceId);
  if (!set) {
    return [];
  }

  set.delete(userId);
  if (set.size === 0) {
    onlineByWorkspace.delete(workspaceId);
  }

  return Array.from(set || []);
}

function getOnlineUsers(workspaceId) {
  const set = onlineByWorkspace.get(workspaceId);
  return Array.from(set || []);
}

module.exports = {
  addUser,
  removeUser,
  getOnlineUsers
};
