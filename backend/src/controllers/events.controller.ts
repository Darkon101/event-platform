import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  fetchEvents,
  fetchEventById,
  insertEvent,
  updateEvent,
  deleteEvent,
  fetchEventsByCreator,
} from "../models/events.model";

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { search, minPrice, maxPrice, startDate, endDate } = req.query;

    const filters = {
      search: search as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    };

    const events = await fetchEvents(filters);

    return res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      message: "Error fetching events",
      error: error.message,
    });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id!);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await fetchEventById(eventId);

    return res.status(200).json({ event });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }

    console.error("Error fetching event:", error);
    return res.status(500).json({
      message: "Error fetching event",
      error: error.message,
    });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const {
      title,
      description,
      location,
      date,
      capacity,
      price,
      external_id,
      image_url,
      url,
    } = req.body;

    if (!title || !location || !date || !capacity) {
      return res.status(400).json({
        message: "Required fields: title, location, date, capacity",
      });
    }

    if (capacity < 1) {
      return res.status(400).json({
        message: "Capacity must be at least 1",
      });
    }

    if (price && price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
      return res.status(400).json({
        message: "Event date must be in the future",
      });
    }

    const eventData = {
      title,
      description: description || "",
      location,
      date: eventDate,
      capacity: parseInt(capacity),
      price: parseFloat(price || 0),
      created_by: req.user.username,
      external_id: external_id || null,
      image_url: image_url || null,
      url: url || null,
    };

    const newEvent = await insertEvent(eventData);

    return res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);

    if (error.message?.includes("Only admin users can create events")) {
      return res.status(403).json({
        message: "Only administrators can create events",
      });
    }

    return res.status(500).json({
      message: "Error creating event",
      error: error.message,
    });
  }
};
export const patchEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const eventId = parseInt(req.params.id!);

    const event = await fetchEventById(eventId);
    if (event.created_by !== req.user.username && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const {
      title,
      description,
      location,
      date,
      capacity,
      price,
      image_url,
      url,
    } = req.body;

    const updates: any = {};

    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location) updates.location = location;
    if (date) {
      const eventDate = new Date(date);
      if (eventDate < new Date()) {
        return res.status(400).json({
          message: "Event date must be in the future",
        });
      }
      updates.date = eventDate;
    }
    if (capacity) {
      if (parseInt(capacity) < 1) {
        return res.status(400).json({
          message: "Capacity must be at least 1",
        });
      }
      updates.capacity = parseInt(capacity);
    }
    if (price !== undefined) {
      if (parseFloat(price) < 0) {
        return res.status(400).json({
          message: "Price cannot be negative",
        });
      }
      updates.price = parseFloat(price);
    }
    if (image_url !== undefined) updates.image_url = image_url;
    if (url !== undefined) updates.url = url;

    const updatedEvent = await updateEvent(eventId, updates);

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({ message: error.msg });
    }

    console.error("Error updating event:", error);
    return res.status(500).json({
      message: "Error updating event",
      error: error.message,
    });
  }
};
export const removeEvent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const eventId = parseInt(req.params.id!);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await fetchEventById(eventId);
    if (event.created_by !== req.user.username && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await deleteEvent(eventId);

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }

    console.error("Error deleting event:", error);
    return res.status(500).json({
      message: "Error deleting event",
      error: error.message,
    });
  }
};
export const getEventsByCreator = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const events = await fetchEventsByCreator(username);

    return res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Error fetching events by creator:", error);
    return res.status(500).json({
      message: "Error fetching events",
      error: error.message,
    });
  }
};
