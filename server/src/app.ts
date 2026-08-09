import cors from "cors";
import express from "express";
import { prisma } from "./config/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import organizationRouter from "./modules/organizations/organization.routes.js";
import teamRouter from "./modules/teams/team.routes.js";
import invitationRouter from "./modules/invitations/invitation.routes.js";
import projectRouter from "./modules/projects/project.routes.js";
import boardColumnRouter from "./modules/board-columns/board-column.routes.js";
import taskRouter from "./modules/tasks/task.routes.js";
import commentRouter from "./modules/comments/comment.routes.js";
import activityRouter from "./modules/activities/activity.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import notificationRouter from "./modules/notifications/notification.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/database-health", async (_request, response) => {
  try {
    const userCount = await prisma.user.count();

    response.status(200).json({
      success: true,
      message: "Database connection is working",
      userCount,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/teams", teamRouter);
app.use("/api/invitations", invitationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/projects", projectRouter);
app.use(
  "/api/board-columns",
  boardColumnRouter
);

app.use(
  "/api/dashboard",
  dashboardRouter
);


app.use(
  "/api/comments",
  commentRouter
);

app.use(
  "/api/activities",
  activityRouter
);

app.use("/api/tasks", taskRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
