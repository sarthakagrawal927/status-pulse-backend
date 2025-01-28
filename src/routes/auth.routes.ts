import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { sendOTP, verifyOTP } from "../controllers/otp.controller";

const router: Router = Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// OTP verification routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Protected routes
router.use(authenticate);
router.get("/me", me);

export default router;
