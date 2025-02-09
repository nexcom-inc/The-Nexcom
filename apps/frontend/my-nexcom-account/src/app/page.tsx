import { Button } from "@the-nexcom/ui";
import LoginCard from "./components/login-card";
import Link from "next/link";

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div className="h-screen flex items-center justify-center">
       <Button  asChild>
        <Link href="/auth/login">
        Login
        </Link>
        </Button>
    </div>
  );
}
