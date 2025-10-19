"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { IoCreateOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { IoLogInOutline } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { IoHeartOutline } from "react-icons/io5";

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="shadow">
      <div className="justify-between items-center flex mx-auto px-4 py-4 max-w-7xl">
        <Link href={"/"}><IoHomeOutline size={30}/></Link>
        <Link href={"/events"}><IoCalendarOutline size={30}/></Link>
        {user?.isAdmin && <Link href={"/events/create"}><IoCreateOutline size={30}/></Link>}
        {user && <Link href="/my-events"><IoHeartOutline size={30}/></Link>}
        {user ? (
          <button onClick={handleLogout}><IoLogOutOutline size={30}/></button>
        ) : (
            <Link href={"/auth/login"}><IoLogInOutline size={30} /></Link>
        )}
      </div>
    </nav>
  );
}
