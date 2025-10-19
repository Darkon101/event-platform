import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  getUserRegistrations,
  isUserRegistered,
  getRegistrationCount,
} from "../models/registrations.model";
import { fetchEventById } from "../models/events.model";

export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const eventId = parseInt(req.params.id!);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await fetchEventById(eventId);


    const registrationCount = await getRegistrationCount(eventId);
    if (registrationCount >= event.capacity) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    const alreadyRegistered = await isUserRegistered(eventId, req.user.username);
    if (alreadyRegistered) {
      return res.status(409).json({ message: "Already registered for this event" });
    }

    const registration = await registerForEvent(eventId, req.user.username);

    return res.status(201).json({
      message: "Successfully registered for event",
      registration,
    });
  } catch (error: any) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.msg });
    }
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }

    console.error("Error registering for event:", error);
    return res.status(500).json({
      message: "Error registering for event",
      error: error.message,
    });
  }
};

export const unregisterUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const eventId = parseInt(req.params.id!);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    await unregisterFromEvent(eventId, req.user.username);

    return res.status(200).json({
      message: "Successfully unregistered from event",
    });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }

    console.error("Error unregistering from event:", error);
    return res.status(500).json({
      message: "Error unregistering from event",
      error: error.message,
    });
  }
};

export const getEventRegistrationsList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const eventId = parseInt(req.params.id!);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    await fetchEventById(eventId);

    const registrations = await getEventRegistrations(eventId);

    return res.status(200).json({
      registrations,
      count: registrations.length,
    });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }

    console.error("Error fetching registrations:", error);
    return res.status(500).json({
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};

export const getUserRegistrationsList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (req.user.username !== username && !req.user.isAdmin) {
      return res.status(403).json({
        message: "You can only view your own registrations",
      });
    }

    const registrations = await getUserRegistrations(username);

    return res.status(200).json({
      registrations,
      count: registrations.length,
    });
  } catch (error: any) {
    console.error("Error fetching user registrations:", error);
    return res.status(500).json({
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};