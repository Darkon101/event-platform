import express from "express"
import { getEvents, getEventById, createEvent, patchEvent, removeEvent, getEventsByCreator } from "../controllers/events.controller"
import { authenticate, requireAdmin } from "../middleware/auth"

const eventsRouter = express.Router();

eventsRouter.get("/events", getEvents);
eventsRouter.get("/events/:id", getEventById);

eventsRouter.post("/events", authenticate, requireAdmin, createEvent);
eventsRouter.patch("/events/:id", authenticate, requireAdmin, patchEvent);
eventsRouter.delete("/events/:id", authenticate, requireAdmin, removeEvent);
eventsRouter.get("/events/creator/:username", authenticate, requireAdmin, getEventsByCreator);

module.exports = eventsRouter;