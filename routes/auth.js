import express from "express";
import { login, logout, refreshToken, register } from "../controllers/auth.js";
import verifyRefreshToken from "../middleware/refreshToken.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", verifyRefreshToken, refreshToken);
router.post("/logout", logout);

export default router;
