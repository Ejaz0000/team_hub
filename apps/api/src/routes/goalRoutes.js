const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireWorkspaceMember } = require("../middleware/workspaceAuth");
const milestoneRoutes = require("./milestoneRoutes");
const {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
} = require("../controllers/goalController");

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, listGoals);
router.post("/", requireAuth, requireWorkspaceMember, createGoal);
router.get("/:goalId", requireAuth, requireWorkspaceMember, getGoal);
router.patch("/:goalId", requireAuth, requireWorkspaceMember, updateGoal);
router.delete("/:goalId", requireAuth, requireWorkspaceMember, deleteGoal);

router.use("/:goalId/milestones", milestoneRoutes);

module.exports = router;
