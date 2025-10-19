export interface User {
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
  created_at: string;
}

export interface Event {
  event_id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
  price: number;
  created_by: string;
  creator_name: string;
  image_url: string | null;
  url: string | null;
  registered_count: number;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export type ErrorWithMessage = {
	message: string
}

export interface Registration {
  registration_id: number;
  event_id: number;
  title: string;
  location: string;
  date: string;
  price: number;
}