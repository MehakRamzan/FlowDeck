import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { changePasswordController, forgotPassword, listSessions, login, me, register, resendVerification, resetPasswordController, revokeSessionController, updateProfile, verifyEmailController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPasswordController);
authRouter.post("/verify-email", verifyEmailController);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me", requireAuth, updateProfile);
authRouter.post("/change-password", requireAuth, changePasswordController);
authRouter.post("/resend-verification", requireAuth, resendVerification);
authRouter.get("/sessions", requireAuth, listSessions);
authRouter.delete("/sessions/:sessionId", requireAuth, revokeSessionController);

export default authRouter;
