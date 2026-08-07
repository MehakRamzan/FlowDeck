import cors from "cors";
import express from "express";
import { prisma } from "./config/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import organizationRouter from "./modules/organizations/organization.routes.js";
import teamRouter from "./modules/teams/team.routes.js";
import invitationRouter from "./modules/invitations/invitation.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/teams", teamRouter);
app.use("/api/invitations", invitationRouter);

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

export default app;