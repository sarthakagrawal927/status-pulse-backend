import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.use(authenticate);
router.get("/me", me);

export default router;
