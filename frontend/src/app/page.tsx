import Link from "next/link";

export default function Home(){
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-4">Welcome to the community events platform!</h1>
      <div className="flex flex-col justify-center gap-4">
        <Link href={'/events'} className="bg-blue-600 text-white rounded-2xl py-3 px-6 ">Browse all events</Link>
        <Link href={"/auth/login"} className="bg-gray-600 text-white rounded-2xl py-3 px-6">Login</Link>
      </div>
    </div>
  )
}