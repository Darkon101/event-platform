"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/lib/errorTs";
import type { Registration } from "@/lib/types";

export default function MyRegistrationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchRegistrations = async () => {
      try {
        const response = await apiClient.get(
          `/users/${user.username}/registrations`
        );
        setRegistrations(response.data.registrations);
      } catch (err: unknown) {
        console.error("Failed to fetch registrations:", getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [user, router]);


  return (
    <>
      <h1 className="text-3xl font-bold mb-6"  >My Events</h1>
      {loading ? (
        // Skeleton loaders
        <div className="flex gap-6 flex-col">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded shadow animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded text-center">
          <p className="font-semibold mb-2">No events registered</p>
          <p className="text-sm">Browse events and register for upcoming activities</p>
          <Link href="/events" className="text-blue-600 hover:underline mt-3 inline-block">
            Browse Events →
          </Link>
        </div>
      ) : (
        <div className="flex gap-6 flex-col">
          {registrations.map((reg) => (
            <Link key={reg.registration_id} href={`/events/${reg.event_id}`}>
              <div className=" p-6 rounded shadow cursor-pointer">
                <h2 className="text-xl font-bold mb-2">{reg.title}</h2>
                <p className="text-gray-600 mb-2">{reg.location}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <p>{new Date(reg.date).toLocaleDateString()}</p>
                  <p className="font-semibold text-blue-600">£{reg.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
