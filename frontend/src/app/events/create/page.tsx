"use client";

import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/errorTs";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: "",
    price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user?.isAdmin) {
    return <h1>Only staff can create events</h1>;
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.post("/events", formData);
      router.push("/events");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit}>
        <section id="create-event" className="mb-6">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded mb-2"
          />
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2"
            
            required
          />
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2"
            required
          />
          <label className="block text-sm font-medium mb-2">Date and Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2"
            required
          />
          <label className="block text-sm font-medium mb-2">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2"
            required
          />
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2"
            required
          />
        </section>
        <div className="flex flex-row justify-center">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? "Creating..." : "Create Event"}{" "}
          </button>
        </div>
      </form>
    </>
  );
}
