import express from "express";
import { getDataUser } from "../controllers/user.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.get("/me", auth, getDataUser);

export default router;
