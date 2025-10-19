"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errorTs";
import apiClient from "@/lib/api";
import Link from "next/link";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get("/events", {
          params: search ? { search } : {},
        });
        setEvents(res.data.events);
      } catch (err: unknown) {
        console.error("failed to fetch events: ", getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchEvents, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded w-full px-4 py-2 mb-6"
      />
       <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white p-6 rounded shadow animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-5 bg-gray-300 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found</p>
          </div>
        ) : (
          events.map((event) => (
            <Link key={event.event_id} href={`/events/${event.event_id}`}>
              <div className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-2">{event.location}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(event.date).toLocaleDateString()}{" "}
                  {new Date(event.date).toLocaleTimeString()}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600 font-bold text-lg">£{event.price}</p>
                  <p className="text-sm text-gray-500">
                    {event.registered_count} / {event.capacity}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
