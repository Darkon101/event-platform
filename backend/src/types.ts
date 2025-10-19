export type User = {
  username: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
};

export type Event = {
  event_id?: number;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: string;
  price: number;
  created_by: string;
  created_at ?: Date;
  external_id?: string;
  image_url?: string;
  url?: string;
}