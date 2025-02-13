"use client";

import { Button } from "@the-nexcom/ui";
import Link from "next/link";
import { useAuth } from "../context/auth.context";

export default function Index() {
  const { user } = useAuth();
  return (
    <div className="h-screen flex items-center justify-center">
      {
        user ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-semibold">Vous etes connecte</p>
            <p className="text-sm">{user.id}</p>
            <p className="text-sm">{user.email}</p>
            <Button  asChild variant='destructive'>
        <Link href="/auth/logout" className=''>
        Logout
        </Link>
        </Button>
          </div>
        ) : (
       <Button  asChild>
        <Link href="/auth/login" className=''>
        Login
        </Link>
        </Button>
        )
      }
    </div>
  );
}
