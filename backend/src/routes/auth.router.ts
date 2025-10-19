import express  from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const authRouter = express.Router();

authRouter.post("/register", register)
authRouter.post("/login", login)

authRouter.get("/me", authenticate, getMe)

module.exports = authRouter