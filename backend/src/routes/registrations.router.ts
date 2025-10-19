import express from "express";
import {
  registerUser,
  unregisterUser,
  getEventRegistrationsList,
  getUserRegistrationsList,
} from "../controllers/registrations.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const registrationsRouter = express.Router();

registrationsRouter.post("/events/:id/register", authenticate, registerUser);
registrationsRouter.delete("/events/:id/register", authenticate, unregisterUser);

registrationsRouter.get(
  "/events/:id/registrations",
  authenticate,
  requireAdmin,
  getEventRegistrationsList
);

registrationsRouter.get(
  "/users/:username/registrations",
  authenticate,
  getUserRegistrationsList
);

module.exports = registrationsRouter;