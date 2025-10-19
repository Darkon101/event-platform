"use client";

import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/errorTs";
import { Event, Registration } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get(`/events/${params.id}`);
        setEvent(res.data.event);
      } catch (err: unknown) {
        console.error("failed to fetch events: ", getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    const checkRegistration = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get(
          `/users/${user.username}/registrations`
        );
        const isUserRegistered = res.data.registrations.some(
          (reg: Registration) => reg.event_id === parseInt(params.id as string)
        );
        setIsRegistered(isUserRegistered);
      } catch (err) {
        console.error("Failed to check registration:", getErrorMessage(err));
      }
    };

    fetchEvent();
    checkRegistration();
  }, [params.id, user]);

  const handleEventRegistration = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setRegistering(true);
    try {
      await apiClient.post(`/events/${params.id}/register`);
      setIsRegistered(true);
      if (event) {
        setEvent({ ...event, registered_count: event.registered_count + 1 });
      }
    } catch (err) {
      alert(getErrorMessage(err) || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleEventUnregistration = async () => {
    setRegistering(true);
    try {
      await apiClient.delete(`/events/${params.id}/register`);
      setIsRegistered(false);
      if (event) {
        setEvent({ ...event, registered_count: event.registered_count - 1 });
      }
    } catch (err) {
      alert(getErrorMessage(err) || "Unregistration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
      <div className="grid md:grid-cols-2">
        {event.image_url && (
            <Image
              src={event.image_url}
              width={"250"}
              height={"250"}
              alt={event.description}
              className="rounded mb-6 "
            />
        )}
        <p className="mb-6">{event.description}</p>
         <div className="space-y-1 mb-6">
        <p>{event.location}</p>
        <p>{new Date(event.date).toLocaleString()}</p>
        <p className="text-blue-600 font-bold">£{event.price}</p>
        <p>
          Capacity: {event.registered_count} / {event.capacity}
        </p>
        <p> Created by: {event.creator_name}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-start">
          {!isRegistered ? (
            <button
              onClick={handleEventRegistration}
              disabled={registering || event.registered_count >= event.capacity}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {registering ? "Registering..." : "Register"}
            </button>
          ) : (
            <div className="flex flex-col gap-6 ">
              <button
                onClick={handleEventUnregistration}
                disabled={registering}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {registering ? "Unregistering..." : "Unregister"}
              </button>
              <AddToCalendarButton
                startDate={new Date(event.date).toISOString().split("T")[0]}
                endDate={
                  new Date(new Date(event.date).getTime() + 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                startTime={new Date(event.date)
                  .toISOString()
                  .split("T")[1]
                  .slice(0, 5)}
                endTime={new Date(new Date(event.date).getTime() + 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[1]
                  .slice(0, 5)}
                name={event.title}
                description={event.description}
                location={event.location}
                options={'Google'}
              />
            </div>
          )}
      </div>
      </div>
    </>
  );
}
